# Расширенные знания

Продолжение темы. Разбираем то, что обычно узнают уже в бою: как устроены билдеры,
что на самом деле делает `ng update`, как настроить CLI под свою команду, как посмотреть
внутрь бандла и как жить в монорепозитории.

---

## 1. Билдеры: чем `ng build` собирает код

`ng build` сам по себе ничего не собирает — он ищет в `angular.json` таргет `build`,
берёт поле `builder` и запускает его. Билдер — это подключаемый пакет.

| Билдер                                          | Основа         | Статус                          |
| ----------------------------------------------- | -------------- | ------------------------------- |
| `@angular/build:application`                    | esbuild + Vite | Дефолт для новых проектов с v17 |
| `@angular/build:dev-server`                     | Vite           | Dev-сервер для `application`    |
| `@angular-devkit/build-angular:browser`         | webpack        | Legacy, поддерживается          |
| `@angular-devkit/build-angular:browser-esbuild` | esbuild        | Промежуточный шаг миграции      |
| `@angular-devkit/build-angular:dev-server`      | webpack        | Dev-сервер для `browser`        |

Разница ощутима: холодная сборка на esbuild обычно в разы быстрее webpack, а dev-сервер
на Vite отдаёт модули без предварительной сборки всего приложения.

Отличается и схема опций. У `browser` точка входа — `main`, у `application` — `browser`,
и появляются поля для SSR:

```jsonc
// @angular-devkit/build-angular:browser (как в этом репозитории)
"options": {
  "outputPath": "dist/app",
  "index": "src/index.html",
  "main": "src/main.ts",
  "polyfills": ["zone.js"],
  "tsConfig": "tsconfig.app.json"
}
```

```jsonc
// @angular/build:application
"options": {
  "outputPath": "dist/app",
  "index": "src/index.html",
  "browser": "src/main.ts",
  "server": "src/main.server.ts",   // опционально, для SSR
  "outputMode": "server",           // "static" для SSG
  "prerender": true,
  "ssr": { "entry": "src/server.ts" },
  "polyfills": ["zone.js"],
  "tsConfig": "tsconfig.app.json"
}
```

### Миграция со старого билдера

Вручную переписывать `angular.json` не нужно — есть миграция:

```bash
ng update @angular/cli --name use-application-builder
```

Она меняет билдер, переименовывает опции и правит пути. После неё стоит проверить:
кастомные webpack-плагины (их у esbuild нет), `scripts` / `styles` с особыми настройками
и всё, что зависело от `ngx-build-plus` или подобных обёрток.

---

## 2. Анатомия `angular.json` целиком

<!-- prettier-ignore -->
```jsonc
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "cli": {
    "packageManager": "npm",
    "analytics": false,
    "schematicCollections": ["@angular-eslint/schematics"],  // где искать схематики
    "cache": { "enabled": true, "path": ".angular/cache", "environment": "local" }
  },
  "schematics": {                        // дефолты для ng generate во всём workspace
    "@schematics/angular:component": {
      "style": "scss",
      "changeDetection": "OnPush",
      "skipTests": false
    }
  },
  "projects": {
    "task-board": {
      "projectType": "application",      // или "library"
      "prefix": "app",                   // префикс селекторов
      "root": "",
      "sourceRoot": "src",
      "architect": { /* таргеты */ }
    }
  }
}
```

### Ключевые опции таргета `build`

| Опция                  | Зачем                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `outputPath`           | Куда класть результат                                             |
| `budgets`              | Лимиты размера; при превышении — warning или падение сборки       |
| `outputHashing`        | Хеши в именах файлов: `none`, `media`, `bundles`, `all`           |
| `optimization`         | Минификация, tree-shaking, инлайн критического CSS                |
| `sourceMap`            | Карты исходников (можно раздельно: `scripts`, `styles`, `vendor`) |
| `fileReplacements`     | Подмена файлов на этапе сборки — механизм окружений               |
| `assets`               | Статика, копируемая в бандл                                       |
| `styles` / `scripts`   | Глобальные стили и скрипты                                        |
| `define`               | Подстановка констант на этапе сборки                              |
| `externalDependencies` | Не бандлить указанные пакеты                                      |
| `statsJson`            | Выгрузить метаданные сборки для анализа                           |
| `serviceWorker`        | Собрать `ngsw.json` для PWA                                       |

### Конфигурации и `fileReplacements`

Классическая схема окружений:

```bash
ng g environments
```

Команда создаёт `src/environments/environment.ts` и `environment.development.ts`
и прописывает подмену в `angular.json`:

```jsonc
"configurations": {
  "development": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.development.ts"
      }
    ]
  }
}
```

Своя конфигурация добавляется рядом:

```jsonc
"staging": {
  "budgets": [{ "type": "initial", "maximumError": "1.5mb" }],
  "outputHashing": "all",
  "baseHref": "/staging/",
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.staging.ts"
    }
  ]
}
```

```bash
ng build --configuration staging
ng serve --configuration staging   # для serve нужен свой блок configurations
```

Конфигурации **комбинируются**: `ng build -c production,ru` применит обе по очереди.

### Бюджеты размера

```jsonc
"budgets": [
  { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
  { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
]
```

Типы: `initial` (первый загружаемый бандл), `allScript`, `all`, `any`,
`anyComponentStyle`, `bundle` (нужно `name`), `anyScript`.
Именно бюджеты чаще всего роняют CI после неосторожного `import` из тяжёлой библиотеки —
и это ровно то, ради чего они существуют.

---

## 3. `zone.js`: откуда Angular узнаёт об изменениях

Строчка `"polyfills": ["zone.js"]`, которую вы только что видели в `angular.json`, —
это не мелкая техническая деталь, а целая стратегия обнаружения изменений.

**Проблема.** Вы поменяли поле класса внутри колбэка `setTimeout`. Откуда фреймворку
знать, что пора перерисовать шаблон? В React вы явно вызываете `setState`.
В Angular исторически ничего вызывать не нужно — и работает это благодаря `zone.js`.

**Что делает `zone.js`.** При загрузке она **патчит асинхронные API браузера**:
`setTimeout`, `setInterval`, `addEventListener`, `XMLHttpRequest`, `fetch`, промисы.
Каждый такой вызов теперь проходит через обёртку, и Angular получает уведомление
«асинхронная задача завершилась». По этому сигналу запускается проверка изменений:
фреймворк обходит дерево компонентов и обновляет то, что разошлось с данными.

```ts
export class Counter {
  count = 0;

  start() {
    setInterval(() => {
      this.count++; // никакого setState — но шаблон обновится
    }, 1000);
  }
}
```

Отсюда, кстати, растёт `NgZone` — сервис, через который можно временно выйти из зоны:

```ts
private readonly zone = inject(NgZone);

heavyAnimation() {
  // цикл анимации не должен дёргать change detection 60 раз в секунду
  this.zone.runOutsideAngular(() => requestAnimationFrame(tick));
}
```

**Чем за это платим:**

- лишний вес в бандле — библиотека грузится всегда, даже если приложение простое;
- проверка запускается на **любое** асинхронное событие, даже когда ничего не изменилось,
  и по умолчанию обходит всё дерево компонентов (это и лечат `OnPush` и сигналы);
- патчи усложняют стек вызовов в отладке и иногда конфликтуют со сторонними библиотеками;
- `async/await` приходится транспилировать вниз, чтобы `zone.js` мог его перехватить.

**Куда движется Angular.** К **zoneless**: сигналы сами сообщают фреймворку,
что именно изменилось, — посредник в виде патчей над браузерным API становится не нужен.

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()],
};
```

Плюс убрать `zone.js` из `polyfills` в `angular.json`. Новый проект можно сразу создать
таким: `ng new my-app --zoneless`.

В версии 20 `provideZonelessChangeDetection()` имеет статус **developer preview** —
в новых проектах пробовать стоит, в существующих переход требует аккуратности: код,
который полагался на автоматическое обнаружение изменений (мутации полей из колбэков,
`setTimeout` без сигналов), придётся перевести на сигналы или `markForCheck()`.

Подробно про change detection, `OnPush` и сигналы — в темах
[best-practices](../../best-practices/lecture/basics.md) и
[signal](../../signal/lecture/basics.md). Здесь достаточно запомнить: `zone.js` — это
механизм «узнать, что что-то произошло», он идёт по умолчанию и постепенно уступает
место сигналам.

---

## 4. `ng config`: правка конфигурации из терминала

```bash
# прочитать
ng config projects.task-board.architect.build.builder
ng config schematics

# записать
ng config schematics.@schematics/angular:component.style scss
ng config schematics.@schematics/angular:component.changeDetection OnPush
ng config cli.packageManager pnpm

# глобальные настройки пользователя (~/.angular-config.json)
ng config --global cli.warnings.versionMismatch false
```

Настройка дефолтов схематик — недооценённая вещь: она избавляет команду от споров
о том, кто забыл поставить `OnPush` или сгенерировал `.css` вместо `.scss`.

---

## 5. `ng add`: установка с настройкой

`ng add` отличается от `npm install` тем, что после установки запускает схематику `ng-add`
из самого пакета — она правит конфиги за вас.

```bash
ng add @angular/material        # тема, шрифты, анимации, глобальные стили
ng add @angular/pwa             # service worker, манифест, иконки
ng add @angular/ssr             # серверный рендеринг
ng add @angular-eslint/schematics
ng add @angular/localize
```

Если пакет поддерживает `ng add`, использовать его руками через `npm i` — значит
доделывать за него работу самому.

---

## 6. `ng update`: обновление с миграциями

Главная причина, по которой Angular удаётся обновлять без выделенного «квартала на апгрейд».

```bash
ng update                                  # показать, что можно обновить
ng update @angular/core @angular/cli       # обновить фреймворк и CLI
ng update @angular/core@20 @angular/cli@20 # до конкретного мажора
ng update @angular/material
```

Что происходит под капотом:

1. проверяется совместимость версий пакетов;
2. обновляются зависимости в `package.json`;
3. запускаются **миграции** — код-модификации, которые правят ваш исходный код:
   переименования API, замена устаревших вызовов, обновление `angular.json`.

Правила, которые экономят нервы:

- обновляться **по одному мажору за раз**: 18 → 19 → 20, а не 18 → 20;
- рабочее дерево должно быть чистым — миграции пишут в файлы, и `git diff` это ваш
  единственный способ посмотреть, что именно они сделали;
- полезные флаги: `--dry-run`, `--force` (при конфликте peer-зависимостей),
  `--migrate-only --from=19 --to=20 --name=<migration>` (прогнать конкретную миграцию,
  например после ручного апдейта версии);
- источник правды по шагам конкретного перехода — [update.angular.dev](https://angular.dev/update-guide).

Примеры реальных миграций последних версий: перевод на standalone-компоненты,
замена `*ngIf` / `*ngFor` на блоки `@if` / `@for`, `inject()` вместо конструктора,
переход на `application` билдер, новые имена файлов из style guide v20.

---

## 7. Свои схематики и генераторы

Схематики — это не магия внутри CLI, а обычные пакеты. Свою коллекцию можно написать
и подключить через `schematicCollections`, чтобы `ng g my-thing` работал в проекте.

Так делают, когда у команды есть свои соглашения: фича-папка определённой структуры,
стор, набор тестов. Проще сгенерировать правильно, чем ревьюить неправильное.

В этом репозитории такой генератор уже есть — правда, на Nx, а не на чистых схематиках:

```
libs/cli/
├── generators.json
└── src/generators/
    ├── challenge/   # создаёт новую задачу целиком
    └── readme/      # генерирует README
```

Смысл тот же: описываете шаблоны файлов и код, который их разворачивает
с подстановкой имён.

---

## 8. Анализ бандла

Когда сборка выросла, надо смотреть, а не гадать.

```bash
# 1. собрать с метаданными
ng build --configuration production --stats-json

# 2. посмотреть, что внутри
npx esbuild-visualizer --metadata dist/task-board/stats.json --open
# для webpack-билдера подойдёт webpack-bundle-analyzer,
# а по sourcemap работает source-map-explorer
npx source-map-explorer dist/task-board/browser/*.js
```

На что смотреть в первую очередь:

- тяжёлые зависимости, попавшие в `initial` (moment, lodash целиком, иконки пачкой);
- то, что должно было быть ленивым, но попало в основной чанк — обычно из-за статического
  `import` там, где нужен `loadComponent` / `loadChildren`;
- дубли библиотек разных версий.

Полезно рядом:

```bash
ng build --configuration production --output-hashing=none  # стабильные имена для diff
ng cache info && ng cache clean                            # если сборка ведёт себя странно
```

---

## 9. Монорепозиторий: несколько проектов в одном workspace

`angular.json` изначально рассчитан на несколько проектов:

```bash
ng generate application admin
ng generate library ui-kit
ng build admin
ng test ui-kit
```

Библиотеки подключаются через path mapping в `tsconfig.base.json` / `tsconfig.json`:

```jsonc
"paths": {
  "@my-org/ui-kit": ["libs/ui-kit/src/index.ts"]
}
```

Этот репозиторий — ровно такой случай: 53 приложения и набор библиотек в `libs/`
(`shared`, `fake-utils`, `testing-table`, `cli` и др.). Когда проектов становятся десятки,
поверх CLI обычно ставят Nx: он добавляет граф зависимостей, кеш и запуск только
затронутых проектов (`nx affected`). Nx не заменяет Angular CLI — он оборачивает те же
билдеры и схематики.

---

## 10. CLI в CI

```bash
ng build --configuration production
ng test --no-watch --no-progress --browsers=ChromeHeadless
ng lint
```

Что стоит помнить:

- **не полагайтесь на глобальный `ng`** — в CI вызывайте через `npx ng` или npm-скрипт;
- кеш `.angular/cache` можно и нужно кешировать между запусками пайплайна;
- отключите аналитику: `ng analytics disable` или переменная `NG_CLI_ANALYTICS=false`;
- падение по бюджетам — это фича, а не помеха: лимиты стоит подтягивать осознанно,
  а не поднимать при каждом красном билде.

---

## Что должно остаться в голове

1. `ng build` — это тонкая обёртка: реальную работу делает **билдер**, указанный
   в `angular.json`. Современный — `@angular/build:application` на esbuild + Vite.
2. `angular.json` читается по схеме **project → target → configuration**; конфигурации
   комбинируются, а окружения делаются через `fileReplacements`.
3. `zone.js` — патч над асинхронными API браузера, из которого Angular узнаёт,
   что пора проверить изменения. Замена — сигналы и zoneless-режим.
4. `ng add` настраивает пакет, `ng update` обновляет код автоматическими миграциями —
   по одному мажору за раз и только на чистом рабочем дереве.
5. Дефолты схематик (`schematics` в `angular.json`) — дешёвый способ зафиксировать
   соглашения команды.
6. Рост бандла диагностируется через `--stats-json` и визуализатор, а удерживается
   бюджетами.

## Практика

- [Задача 1 — Первое приложение на CLI](../tasks/first-app/README.md)
- [Задача 2 — Приручить `angular.json`](../tasks/cli-config/README.md)
