# Skills: RxJS для Angular

Набор скиллов для AI-агентов (Claude Code, OpenCode, Copilot, Cursor и совместимых), описывающих корректное использование RxJS в типовом Angular-проекте.

## Зачем это нужно

RxJS требует понимания контракта Observable, жизненного цикла подписок и семантики higher-order операторов. Скиллы передают агенту эти правила в момент, когда он пишет или проверяет код, поэтому генерируемые решения соответствуют практикам, которые разбираются на лекции и в демо-приложении:

- **очистка подписок** — `takeUntilDestroyed`, `async` pipe вместо ручных списков;
- **выбор higher-order оператора по семантике задачи** — `switchMap` для поиска и навигации, `exhaustMap` для submit, `concatMap` для очередей;
- **комбинирование источников** — `combineLatest` для живых потоков, `forkJoin` для завершающихся задач;
- **обработка ошибок** — `catchError`, `retry`, `finalize`;
- **интероп с signals** — `toSignal` / `toObservable`.

Скиллы загружаются агентом по мере необходимости (progressive disclosure: ~100 токенов на метаданные, полный текст — только при релевантной задаче).

## Зачем мы даём их студентам

Студенты работают с AI-агентами при выполнении заданий. Скиллы выполняют роль «учебного контракта» между студентом и агентом:

1. **Единая терминология.** Агент использует те же формулировки, что и лекция: «забудь прошлое, работай с актуальным» для `switchMap`, контракт `next* → (error | complete)?` и т.д. Студент видит в коде агента ровно те концепции, которые разбирались на занятии.
2. **Проверяемые решения.** Сгенерированный код следует правилам из скиллов — студент может сверить его с памяткой «ситуация → оператор» из лекции и объяснить каждый выбор оператора.
3. **Самостоятельная работа.** При домашней работе агент не «угадывает» оператор, а применяет алгоритм выбора из раздела Higher-order mapping — студент учится формулировать задачу словами и находить оператор по таблице.
4. **Типовые сценарии из демо.** Паттерны скиллов (поиск, навигация, submit, параллельные запросы, состояния экрана, утечка подписки) совпадают со сценариями демо-приложения — код агента и живое демо иллюстрируют одно и то же.

## Скиллы

| Скилл | Назначение |
|-------|------------|
| [`rxjs-fundamentals`](rxjs-fundamentals/SKILL.md) | Ядро RxJS вне фреймворка: контракт Observable, операторы создания, pipe, четыре стратегии higher-order mapping, комбинирование, обработка ошибок, Subjects, жизненный цикл подписки |
| [`rxjs-angular`](rxjs-angular/SKILL.md) | RxJS в экосистеме Angular: HttpClient как cold Observable, Router params + switchMap, valueChanges, AsyncPipe vs takeUntilDestroyed, shareReplay, интероп с signals (toSignal/toObservable), тестирование через TestScheduler и fakeAsync |

## Источники

Содержимое собрано и переработано из проверенных открытых репозиториев:

- **[angular/skills](https://github.com/angular/skills)** — официальные скиллы команды Angular (MIT): правила HttpClient, injection context, signals interop, тестирование;
- **[jeffallan/claude-skills](https://github.com/jeffallan/claude-skills)** — скилл `angular-architect` (MIT), reference `rxjs.md`: паттерны операторов, обработка ошибок, memory management;
- **[majiayu000/claude-skill-registry](https://github.com/majiayu000/claude-skill-registry)** — скилл `rxjs-patterns`: базовые практики RxJS в Angular;
- **[rxjs.dev](https://rxjs.dev)** — официальная документация RxJS.

## Подключение

### Claude Code

```bash
npx skills add ./skills
```

или вручную — скопируйте папки скиллов в `.claude/skills/` проекта.

### OpenCode

OpenCode читает скиллы из каталога `.opencode/skill/` проекта (или глобально из `~/.config/opencode/skill/`). Скопируйте папки скиллов:

```bash
mkdir -p .opencode/skill
cp -r skills/rxjs-fundamentals skills/rxjs-angular .opencode/skill/
```

Каждый скилл — папка с `SKILL.md` и YAML-frontmatter (`name`, `description`); OpenCode подхватывает их автоматически и активирует по описанию при релевантной задаче.

### Visual Studio Code

Для GitHub Copilot в VS Code подключите `SKILL.md` как instructions-файл через `.github/copilot-instructions.md`:

```markdown
При работе с RxJS и Angular следуй правилам из файлов:
- [skills/rxjs-fundamentals/SKILL.md](../skills/rxjs-fundamentals/SKILL.md)
- [skills/rxjs-angular/SKILL.md](../skills/rxjs-angular/SKILL.md)
```

Альтернатива — расширение, поддерживающее формат Agent Skills (например, через `npx skills add ./skills` с совместимым CLI), либо добавление содержимого `SKILL.md` в профильные rules-файлы расширений AI-ассистентов (Continue, Cline, Roo Code — у каждого свой каталог rules, формат тот же Markdown).

### WebStorm

JetBrains AI Assistant поддерживает правила проекта через файл `.junie/guidelines.md` (для Junie) либо через настройки AI Assistant → Guidelines. Добавьте ссылки на скиллы:

```markdown
# RxJS rules
Follow the rules in:
- skills/rxjs-fundamentals/SKILL.md
- skills/rxjs-angular/SKILL.md
```

Если используется сторонний AI-плагин (Continue, Cline), укажите путь к `SKILL.md` в его конфигурации rules/context — формат обычный Markdown.

## Структура

```
skills/
├── README.md
├── rxjs-fundamentals/
│   └── SKILL.md
└── rxjs-angular/
    └── SKILL.md
```
