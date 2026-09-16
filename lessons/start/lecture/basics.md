# Базовые знания

Вводная тема курса. Отвечаем на четыре вопроса: что такое Angular, чем он отличается
от React, из каких пакетов состоит и что такое Angular CLI.

Версии, о которых идёт речь (взяты из `package.json` этого репозитория):
Angular **20.0.6**, Angular CLI **20.0.5**, TypeScript **5.8.3**.

---

## 1. Что такое Angular

**Angular — это фреймворк для построения клиентских приложений**, который разрабатывает
и поддерживает Google. Написан на TypeScript, первая версия (тогда — AngularJS) вышла
в 2010, полностью переписанный Angular 2 — в 2016. С тех пор это одна кодовая база
с предсказуемым релизным циклом.

Ключевое слово — **фреймворк**, а не библиотека. Разница не в размере, а в том,
кто кого вызывает:

- библиотеку вызываете вы (`lodash.groupBy(...)`);
- фреймворк вызывает ваш код — вы пишете компоненты и сервисы, а Angular решает,
  когда их создать, когда обновить DOM, когда уничтожить.

### Что входит «в коробку»

| Задача                     | Решение в Angular                          |
| -------------------------- | ------------------------------------------ |
| UI-компоненты и шаблоны    | `@angular/core`, `@angular/common`         |
| Реактивность               | Signals, RxJS                              |
| Внедрение зависимостей     | `@angular/core` (DI-контейнер)             |
| Маршрутизация              | `@angular/router`                          |
| Формы и валидация          | `@angular/forms`                           |
| HTTP-клиент                | `@angular/common/http`                     |
| Анимации                   | `@angular/animations`                      |
| SSR / SSG                  | `@angular/ssr`, `@angular/platform-server` |
| Интернационализация        | `@angular/localize`                        |
| Сборка, генерация, апдейты | `@angular/cli`, `@angular/build`           |

Это принципиальная позиция Angular: типовые задачи закрыты официальными решениями
одной команды, с одной документацией и синхронными версиями.

### Релизный цикл

- **мажорная версия — раз в полгода** (примерно в мае и ноябре);
- минорные — примерно раз в месяц;
- поддержка мажора — **18 месяцев**: 6 месяцев активной поддержки + 12 месяцев LTS;
- ломающие изменения сопровождаются **автоматическими миграциями кода** — обновление
  делается командой `ng update`, а не руками.

### Из чего состоит приложение

Минимальный набор понятий, к которым мы будем возвращаться весь курс:

- **Компонент** — класс с декоратором `@Component` и шаблоном. Единица UI.
  **Standalone**-компоненты появились в v14 и стали поведением по умолчанию в v19:
  `NgModule` для них не нужен.
- **Шаблон** — HTML с расширенным синтаксисом: `{{ interpolation }}`,
  `[property]`, `(event)`, `[(ngModel)]`, блоки `@if / @for / @switch`.
- **Сервис** — класс с `@Injectable`, куда выносится логика и состояние.
- **DI (Dependency Injection)** — встроенный контейнер, который создаёт сервисы
  и раздаёт их через `inject()` или конструктор.
- **Сигналы (Signals)** — реактивные примитивы (`signal`, `computed`, `effect`),
  на которых строится современный Angular.
- **RxJS** — потоки (stream) событий; используются в HTTP, роутере, формах.

Точка входа приложения — то, что генерирует CLI в v20:

```ts
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

```ts
// src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
```

```ts
// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('my-app');
}
```

> ⚠️ Обратите внимание на имена файлов: `app.ts`, а не `app.component.ts`.
> В Angular 20 обновили style guide и убрали суффиксы `.component` / `.service`
> из генерируемых имён. Старый стиль остаётся валидным — огромное количество кода
> (включая задачи в этом репозитории) написано по-старому. Вернуть суффикс
> можно флагом `--type`, см. раздел про CLI.

---

## 2. Чем Angular отличается от React

Сравнение честное: вопрос не «что лучше», а «где проходит граница ответственности».

|                   | **Angular**                                | **React**                                 |
| ----------------- |--------------------------------------------| ----------------------------------------- |
| Что это           | Фреймворк                                  | Библиотека рендеринга UI                  |
| Язык              | TypeScript обязателен                      | JS или TS на выбор                        |
| Разметка          | HTML-шаблоны со своим синтаксисом          | JSX (это JavaScript)                      |
| Компонент         | Класс с декоратором                        | Функция                                   |
| Состояние         | Signals, RxJS, поля класса, сервисы        | `useState`, `useReducer`, внешние сторы   |
| Обновление DOM    | Точечное, без Virtual DOM                  | Реконсиляция Virtual DOM                  |
| Зависимости       | Встроенный DI-контейнер                    | Пропсы и Context                          |
| Роутинг           | `@angular/router` из коробки               | `react-router` и др.                      |
| Формы             | `@angular/forms` из коробки                | `react-hook-form`, `formik` и др.         |
| HTTP              | `@angular/common/http` из коробки          | `fetch`, `axios`, TanStack Query          |
| Тулинг            | Angular CLI: генерация, сборка, апдейты    | Vite / Next.js, конфиг собирается вручную |
| Обновление версий | `ng update` + автоматические миграции кода | Ручное обновление, codemods по желанию    |

### Что стоит за этими различиями

**Шаблоны против JSX.**
В React разметка — это выражение языка: можно вернуть массив, вызвать `map`, положить
JSX в переменную. Гибко, но проверяется только тем, что умеет TypeScript.
В Angular шаблон — отдельный язык, который компилируется в инструкции. Это ограничивает
(произвольный JS в шаблон не напишешь), зато компилятор **типизирует шаблон**,
понимает `@if` / `@for`, статически видит зависимости и вырезает неиспользуемое.

<!-- prettier-ignore -->
```html
<!-- Angular 17+ -->
@if (user(); as u) {
  <p>{{ u.name }}</p>
} @else {
  <p>Гость</p>
}

@for (task of tasks(); track task.id) {
  <app-task-item [task]="task" (done)="complete(task.id)" />
}
```

<!-- prettier-ignore -->
```jsx
// React
{user ? <p>{user.name}</p> : <p>Гость</p>}
{tasks.map((task) => (
  <TaskItem key={task.id} task={task} onDone={() => complete(task.id)} />
))}
```

**DI против пропсов и контекста.**
Пожалуй, главное архитектурное отличие. В Angular зависимость запрашивается по токену,
а какую реализацию подставить — решает дерево инжекторов:

```ts
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
}

@Component({
  /* ... */
})
export class TaskList {
  private readonly tasks = inject(TaskService); // никто не передавал это пропсом
}
```

В React ту же задачу решают Context, кастомные хуки или внешний стор. Работает, но
подмена реализации в тестах и на разных уровнях дерева требует ручной обвязки, тогда как
в Angular это штатный механизм (`providers`, `useClass`, `useValue`, `InjectionToken`) —
ему посвящена отдельная тема курса.

**Реактивность.**
React перерисовывает компонент целиком и сравнивает результат через Virtual DOM.
Angular Virtual DOM не использует: шаблон компилируется в код, который знает,
какие именно узлы обновлять. Исторически Angular узнавал об изменениях через `zone.js`
(патч над `setTimeout`, событиями, XHR). Сейчас курс движения — **сигналы и zoneless**:
изменение сигнала само сообщает фреймворку, что нужно обновить.

```ts
export class Counter {
  readonly count = signal(0);
  readonly double = computed(() => this.count() * 2);

  inc() {
    this.count.update((v) => v + 1); // Angular знает, какие узлы затронуты
  }
}
```

**Границы ответственности.**
Собранное React-приложение — это ваш личный набор из десятка библиотек, который вы
обновляете сами и который у каждой команды свой. Angular задаёт единый набор и берёт
обновления на себя. Первое даёт свободу, второе — предсказуемость на длинной дистанции
и переносимость людей между проектами.

**Когда что выбирать.**
Angular особенно хорош там, где приложение живёт годами, команда большая, важны единый
стиль и дешёвое обновление. React — там, где нужна максимальная гибкость, есть готовая
экосистема под задачу или нужен тонкий контроль над бандлом. Обе технологии решают одни
и те же задачи; выбор чаще диктуется командой и сроком жизни продукта, а не техническими
пределами.

---

## 3. Из чего состоит Angular: пакеты

Angular поставляется не одним пакетом, а набором `@angular/*`. Так сделано ради
tree-shaking (не используешь формы — их кода не будет в бандле) и ради разных платформ
(браузер, сервер).

### Ядро — есть почти в каждом проекте

| Пакет                       | Зачем                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@angular/core`             | Сердце фреймворка: `@Component`, `@Injectable`, DI, сигналы, lifecycle hooks, change detection                                                          |
| `@angular/common`           | Общее: `NgClass`, `NgTemplateOutlet`, пайпы `DatePipe` / `AsyncPipe` / `CurrencyPipe`, `NgOptimizedImage`, а также `@angular/common/http` — HTTP-клиент |
| `@angular/compiler`         | Компилятор шаблонов; при AOT работает на этапе сборки и в прод-бандл не попадает                                                                        |
| `@angular/platform-browser` | Запуск в браузере: `bootstrapApplication`, работа с DOM, `DomSanitizer`, `Title` / `Meta`                                                               |

### Функциональные пакеты — по необходимости

| Пакет                                       | Зачем                                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `@angular/router`                           | Маршрутизация: `provideRouter`, `routerLink`, guards, resolvers, ленивая загрузка                                |
| `@angular/forms`                            | Формы: template-driven (`ngModel`) и reactive (`FormControl`, `FormGroup`, `Validators`, `ControlValueAccessor`) |
| `@angular/animations`                       | Анимации переходов и состояний                                                                                   |
| `@angular/service-worker`                   | PWA, офлайн-кеш                                                                                                  |
| `@angular/localize`                         | i18n: извлечение и подстановка переводов                                                                         |
| `@angular/elements`                         | Упаковка Angular-компонента в Custom Element                                                                     |
| `@angular/platform-server` + `@angular/ssr` | Рендеринг на сервере, гидратация, prerender                                                                      |

### Инструменты и UI

| Пакет                           | Зачем                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `@angular/cli`                  | Командная строка `ng`                                                                  |
| `@angular/build`                | Современные билдеры на esbuild + Vite                                                  |
| `@angular-devkit/build-angular` | Старые билдеры на webpack (используются в этом репозитории)                            |
| `@angular/compiler-cli`         | AOT-компиляция, проверка типов в шаблонах                                              |
| `@angular/cdk`                  | Component Dev Kit: overlay, drag-and-drop, a11y, virtual scroll — поведение без стилей |
| `@angular/material`             | Готовые компоненты по Material Design поверх CDK                                       |

Всё это версионируется синхронно: `@angular/core` 20.0.6 работает с `@angular/router` 20.0.6.
Отдельно живут только `@angular/cdk` и `@angular/material` (своя, но совместимая нумерация)
и внешние зависимости — `rxjs`, `zone.js`, `tslib`.

### Как это выглядит в реальном `package.json`

```jsonc
// package.json этого репозитория (фрагмент)
"dependencies": {
  "@angular/animations": "20.0.6",
  "@angular/cdk": "20.0.5",
  "@angular/common": "20.0.6",
  "@angular/compiler": "20.0.6",
  "@angular/core": "20.0.6",
  "@angular/forms": "20.0.6",
  "@angular/material": "20.0.5",
  "@angular/platform-browser": "20.0.6",
  "@angular/router": "20.0.6",
  "@angular/ssr": "20.0.5",
  "rxjs": "7.8.1",
  "zone.js": "0.15.1"
}
```

Одинаковый номер версии у всех `@angular/*` — не совпадение, а требование.
Рассинхронизация версий — частая причина непонятных ошибок сборки.

---

## 4. Angular CLI

**Angular CLI — официальная командная строка Angular.** Она создаёт проекты, генерирует
код, поднимает dev-сервер, собирает прод-бандл, гоняет тесты и обновляет версии фреймворка.

Это не «удобная обёртка, без которой можно обойтись»: конфигурация сборки, AOT-компиляция
и миграции между версиями завязаны на CLI. В Angular-мире её используют практически все —
ещё одно отличие от React, где сборку каждая команда собирает под себя.

### Установка и запуск

```bash
# разово, без глобальной установки — версия берётся под конкретный проект
npx @angular/cli@20 new my-app

# либо глобально
npm install -g @angular/cli
ng version
```

Внутри проекта `ng` берётся из локального `node_modules`, поэтому глобальная версия CLI
и версия проекта могут отличаться — это нормально.

### Основные команды

| Команда                            | Что делает                                         |
| ---------------------------------- | -------------------------------------------------- |
| `ng new <name>`                    | Создать новый проект (workspace + приложение)      |
| `ng serve`                         | Dev-сервер с hot reload                            |
| `ng build`                         | Сборка (по умолчанию — production)                 |
| `ng generate <schematic>` (`ng g`) | Сгенерировать компонент, сервис, пайп и т. д.      |
| `ng test`                          | Юнит-тесты                                         |
| `ng lint`                          | Линтер (после `ng add @angular-eslint/schematics`) |
| `ng add <package>`                 | Установить пакет **и настроить его**               |
| `ng update`                        | Обновить Angular с автоматическими миграциями кода |
| `ng config`                        | Прочитать / изменить `angular.json` из терминала   |
| `ng version`                       | Версии Angular, CLI, Node, TypeScript              |
| `ng cache`                         | Управление кешем сборки                            |
| `ng completion`                    | Автодополнение команд в shell                      |

### `ng new`: создание проекта

```bash
ng new task-board --style=scss --routing
```

Полезные флаги:

| Флаг                | По умолчанию | Что делает                                         |
| ------------------- | ------------ | -------------------------------------------------- |
| `--style`           | `css`        | Препроцессор стилей: `css`, `scss`, `sass`, `less` |
| `--routing`         | `true`       | Сгенерировать `app.routes.ts` и подключить роутер  |
| `--ssr`             | `false`      | Настроить серверный рендеринг                      |
| `--zoneless`        | `false`      | Приложение без `zone.js` (появилось в v20)         |
| `--standalone`      | `true`       | Standalone-компоненты без `NgModule`               |
| `--skip-tests`      | `false`      | Не создавать `.spec.ts`                            |
| `--minimal`         | `false`      | Вообще без тестового фреймворка                    |
| `--package-manager` | `npm`        | `npm`, `yarn`, `pnpm`, `bun`                       |
| `--dry-run` (`-d`)  | —            | Показать, что будет создано, ничего не записывая   |

Если флаги не указать, CLI задаст вопросы интерактивно.

Что получится:

```
task-board/
├── angular.json          # конфигурация: проекты, таргеты, билдеры
├── package.json
├── tsconfig.json         # общий конфиг TS
├── tsconfig.app.json     # конфиг приложения
├── tsconfig.spec.json    # конфиг тестов
├── public/
│   └── favicon.ico
└── src/
    ├── index.html
    ├── main.ts           # точка входа: bootstrapApplication
    ├── styles.scss       # глобальные стили
    └── app/
        ├── app.ts        # корневой компонент
        ├── app.html
        ├── app.scss
        ├── app.config.ts # провайдеры приложения
        ├── app.routes.ts # маршруты
        └── app.spec.ts
```

### `ng generate`: генерация кода

Главная команда повседневной работы. Она не просто создаёт файлы: соблюдает соглашения
об именах, генерирует селектор с префиксом, создаёт спеку и, где нужно, регистрирует
созданное.

```bash
ng g component task-list          # компонент (сокращённо: ng g c)
ng g service task                 # сервис
ng g pipe time-ago                # пайп
ng g directive highlight          # директива
ng g guard auth                   # guard для роутера
ng g interceptor auth             # HTTP-интерсептор
ng g resolver user                # resolver
ng g interface task               # интерфейс
ng g enum status                  # enum
ng g class task-store             # обычный класс
ng g environments                 # файлы окружений + fileReplacements в angular.json
ng g service-worker               # PWA
ng g library ui                   # библиотека внутри workspace
```

Что стоит запомнить:

```bash
# посмотреть результат, ничего не создавая — привычка, экономящая время
ng g c task-list --dry-run

# сразу OnPush, без отдельных файлов шаблона и стилей
ng g c task-item --change-detection=OnPush --inline-template --inline-style

# вернуть привычный суффикс: task-list.component.ts вместо task-list.ts
ng g c task-list --type=component

# положить по конкретному пути, без создания вложенной директории
ng g c features/board/task-list --flat
```

Полный список опций схематики — `ng g c --help`.

### `ng serve` и `ng build`

```bash
ng serve --port 4300 --open          # dev-сервер, открыть браузер
ng build                             # прод-сборка в dist/
ng build --configuration development # сборка без оптимизаций
ng build --watch                     # пересборка при изменениях
```

Разница между режимами существенная. В `production` включены AOT, минификация,
tree-shaking, хеши в именах файлов и **бюджеты размера** — сборка упадёт, если бандл
вырос сверх лимита. В `development` — sourcemaps и быстрая пересборка.

### `angular.json` — конфигурация workspace

Один файл описывает все проекты и то, как их собирать:

<!-- prettier-ignore -->
```jsonc
{
  "projects": {
    "task-board": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "architect": {              // в новых проектах этот ключ называется "targets"
        "build": {
          "builder": "@angular/build:application",  // ЧЕМ собирать
          "options": {                              // общие опции
            "outputPath": "dist/task-board",
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "styles": ["src/styles.scss"]
          },
          "configurations": {                       // именованные режимы
            "production": { "outputHashing": "all", "budgets": [] },
            "development": { "optimization": false, "sourceMap": true }
          },
          "defaultConfiguration": "production"
        },
        "serve": { "builder": "@angular/build:dev-server" },
        "test": { "builder": "@angular/build:karma" }
      }
    }
  }
}
```

Три уровня, которые надо различать:

1. **project** — приложение или библиотека;
2. **target** (`build`, `serve`, `test`, `lint`) — что можно с проектом сделать;
3. **configuration** (`production`, `development`, `staging`) — вариант опций таргета.

Отсюда синтаксис команд: `ng build task-board --configuration production`.

### Как устроен этот репозиторий

Полезно сразу увидеть, что бывает не только «одно приложение на workspace».
Здесь **53 проекта** в одном `angular.json` — по проекту на учебную задачу:

```jsonc
"angular-injection-token": {
  "projectType": "application",
  "root": "lessons/dependency-injection/tasks/injection-token",
  "sourceRoot": "lessons/dependency-injection/tasks/injection-token/src",
  "architect": {
    "build": { "builder": "@angular-devkit/build-angular:browser" }
  }
}
```

Запускается это через npm-скрипты в `package.json`:

```jsonc
"serve:angular-injection-token": "ng serve angular-injection-token"
```

Два наблюдения, полезных для понимания:

- имя проекта (`angular-injection-token`) не обязано совпадать с путём к папке —
  связь задаётся полем `root`;
- здесь используется **старый билдер** `@angular-devkit/build-angular:browser`
  (на webpack), а `ng new` в v20 создаёт проекты с `@angular/build:application`
  (на esbuild + Vite). Поддерживаются оба; про различия и миграцию — в `advanced.md`.

---

## Что должно остаться в голове

1. Angular — фреймворк с батарейками: UI, DI, роутер, формы, HTTP, SSR от одной команды.
2. От React отличается прежде всего шаблонами вместо JSX, встроенным DI, отсутствием
   Virtual DOM и тем, что тулинг и обновления — часть фреймворка.
3. Фреймворк разбит на пакеты `@angular/*` с синхронными версиями; в бандл попадает только
   то, что вы реально импортируете.
4. Angular CLI — рабочий инструмент, а не опция: `ng new`, `ng generate`, `ng serve`,
   `ng build`, `ng update`. Всё, что она делает, описано в `angular.json`.

## Практика

- [Задача 1 — Первое приложение на CLI](../tasks/first-app/README.md)
- [Задача 2 — Приручить `angular.json`](../tasks/cli-config/README.md)
