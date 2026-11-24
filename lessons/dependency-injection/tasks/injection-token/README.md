# InjectionToken — Challenge

## Проблема

В приложении есть экран видеозвонка `VideoComponent` с таймером, который тикает раз в **1 секунду**.
Значение интервала хранится в глобальной константе `DEFAULT_TIMER` (`data.ts`), и её напрямую
импортируют `TimerContainerComponent` и `TimerComponent`.

Через несколько недель продуктовая команда попросила добавить экран телефонного звонка `PhoneComponent`
и переиспользовать на нём тот же таймер — но с интервалом **2 секунды**.
Сейчас на экране **Phone** таймер по-прежнему тикает раз в секунду.

## Задача

Сделай так, чтобы:
- на экране **Phone** и `TimerContainerComponent`, и `TimerComponent` использовали значение `2000`;
- на экране **Video** осталось значение по умолчанию `1000`.

## Ограничения

- Нельзя использовать `@Input` / `input()`. В этом простом примере input был бы нормальным решением,
  но в реальном приложении нужный компонент может быть вложен очень глубоко, и прокидывать значение
  через все уровни — плохой дизайн.

## Запуск

```bash
npm run serve:angular-injection-token
```

## Полезные материалы

- Лекция: [InjectionToken](../../lecture/basics.md#injectiontoken), [Providers](../../lecture/basics.md#providers), [Иерархия инжекторов](../../lecture/basics.md#иерархия-инжекторов)
- [Что такое InjectionToken](https://angular.dev/guide/di/defining-dependency-providers#what-is-an-injectiontoken) и [InjectionToken с `providedIn: 'root'` и `factory`](https://angular.dev/guide/di/defining-dependency-providers#injectiontoken-with-providedin-root)
- [`useValue`](https://angular.dev/guide/di/defining-dependency-providers#usevalue) — как подставить для токена конкретное значение
- [Провайдеры компонента или директивы](https://angular.dev/guide/di/defining-dependency-providers#component-or-directive-providers)
- [Иерархический DI: правила поиска зависимости](https://angular.dev/guide/di/hierarchical-dependency-injection#resolution-rules)
- API: [`InjectionToken`](https://angular.dev/api/core/InjectionToken)
- Статья: [Stop being scared of InjectionTokens](https://itnext.io/stop-being-scared-of-injectiontokens-ab22f72f0fe9) (на английском)

## Подсказки

<details>
  <summary>Подсказка 1 — чем заменить глобальную константу?</summary>

Константу, которую импортируют напрямую, нельзя подменить для части дерева компонентов.
А значение, полученное через DI, — можно. Создай `InjectionToken<number>` и получай значение таймера
через `inject()` вместо импорта `DEFAULT_TIMER`.

</details>

<details>
  <summary>Подсказка 2 — откуда взять значение по умолчанию?</summary>

Чтобы не регистрировать провайдер вручную для экрана Video, задай токену `factory`, которая возвращает
`DEFAULT_TIMER`. Тогда токен будет доступен «из коробки» на уровне root.

</details>

<details>
  <summary>Подсказка 3 — как подменить значение только для Phone?</summary>

Добавь в `providers` компонента `PhoneComponent` провайдер токена с `useValue: 2000`.
Angular ищет зависимость снизу вверх по дереву инжекторов, поэтому все дочерние компоненты `PhoneComponent`
найдут этот провайдер раньше, чем значение по умолчанию из root.

</details>
