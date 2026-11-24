# Master Dependency Injection — Challenge

## Проблема

Приложение выводит таблицу товаров (`TableComponent` из `@angular-challenges/shared/ui`).
Цены в ячейках форматирует `CurrencyPipe`: он внедряет `CurrencyService` и дописывает к цене символ валюты из сервиса.

`CurrencyService` указан в `providers` у `AppComponent`, то есть на уровне всей таблицы:
все строки получают один и тот же экземпляр с валютой по умолчанию `EUR`. Поэтому в каждой строке
отображается `€`, хотя у каждого товара своя валюта (поле `currencyCode` в `product.model.ts`).

## Задача

Сделай так, чтобы каждая строка таблицы показывала цены в валюте своего товара:
bike — `US$`, watch — `AU$`, computer — `£`, headset — `CAD` и т.д.

Для этого `CurrencyService` нужно предоставить **на уровне строки**: у каждой строки должен быть
свой экземпляр сервиса со своим кодом валюты.

## Ограничения

- Нельзя изменять `currency.pipe.ts` — в том числе добавлять пайпу второй аргумент с валютой.
- Нельзя оборачивать строку в компонент — это сломает вёрстку таблицы.

## Запуск

```bash
npm run serve:angular-master-dependency-injection
```

## Полезные материалы

- Лекция: [Иерархия инжекторов](../../lecture/basics.md#иерархия-инжекторов), [Переопределение сервиса на уровне компонента](../../lecture/advanced.md#переопределение-сервиса-на-уровне-компонента)
- [Иерархический DI](https://angular.dev/guide/di/hierarchical-dependency-injection): [ElementInjector](https://angular.dev/guide/di/hierarchical-dependency-injection#elementinjector) и [правила поиска зависимости](https://angular.dev/guide/di/hierarchical-dependency-injection#resolution-rules)
- [Провайдеры компонента или директивы](https://angular.dev/guide/di/defining-dependency-providers#component-or-directive-providers) — поле `providers` есть не только у `@Component`, но и у `@Directive`
- [Атрибутные директивы](https://angular.dev/guide/directives/attribute-directives)
- [Inputs](https://angular.dev/guide/components/inputs) — как передать данные в директиву через `input()`
- [ComponentStore: обновление состояния (`setState`, `patchState`)](https://ngrx.io/guide/component-store/write) — `CurrencyService` построен на `ComponentStore` из NgRx

## Подсказки

<details>
  <summary>Подсказка 1 — откуда пайп берёт сервис?</summary>

`inject()` внутри пайпа ищет зависимость начиная с элемента шаблона, на котором используется пайп,
и дальше вверх по дереву `ElementInjector`-ов. Значит, если провайдер `CurrencyService` появится
на элементе выше `<td>`, пайп возьмёт его, а не экземпляр из `AppComponent`.

</details>

<details>
  <summary>Подсказка 2 — как добавить провайдер на &lt;tr&gt;, не создавая компонент?</summary>

У `@Directive` тоже есть поле `providers`. Создай атрибутную директиву, повесь её на `<tr>`
и укажи в ней `providers: [CurrencyService]` — у каждой строки появится свой экземпляр сервиса.

</details>

<details>
  <summary>Подсказка 3 — как передать сервису нужную валюту?</summary>

Передай в директиву `product.currencyCode` через `input()`, внедри в директиве её собственный
`CurrencyService` и запиши код валюты в состояние стора через `patchState`.
Учти, что значение input-а ещё недоступно в конструкторе — используй `ngOnInit` или `effect`.

</details>
