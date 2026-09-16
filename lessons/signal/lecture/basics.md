# Базовые знания

Тема урока — сигналы: реактивный примитив Angular, на котором построены `input`, `model`,
`output`, сигнальные запросы (`viewChild`), `resource` и zoneless change detection.

Практическая часть урока — 5 задач: три базовые (🟢) и две сложные (🔴).

| Задача                                                          | Уровень | Тема                                      | Запуск                                           |
| --------------------------------------------------------------- | ------- | ----------------------------------------- | ------------------------------------------------ |
| [signal-input](../tasks/signal-input)                           | 🟢      | сигнальные входы вместо `@Input`          | `npm run serve:signal-signal-input`              |
| [bug-in-effect](../tasks/bug-in-effect)                         | 🟢      | почему `effect` не срабатывает            | `npm run serve:signal-bug-in-effect`             |
| [function-call-effect](../tasks/function-call-effect)           | 🟢      | почему `effect` срабатывает слишком часто | `npm run serve:signal-function-call-effect`      |
| [pipe-observable-to-signal](../tasks/pipe-observable-to-signal) | 🔴      | перевод состояния с RxJS на сигналы       | `npm run serve:signal-pipe-observable-to-signal` |
| [forms-and-signal](../tasks/forms-and-signal)                   | 🔴      | реактивные формы + сигналы                | `npm run serve:signal-forms-and-signal`          |

Базовых знаний этой страницы хватает для трёх первых задач. Две сложные требуют материала
из [расширенной части](./advanced.md): тайминга эффектов, `linkedSignal` и понимания того,
как реактивный контекст работает внутри пайпов и форм.

---

## 1. Сигнал как значение + граф зависимостей

Сигнал — это контейнер со значением, который знает, кто его прочитал.

```ts
const count = signal(0); // WritableSignal<number>

count(); // чтение → 0
count.set(5); // запись нового значения
count.update((c) => c + 1); // запись на основе предыдущего
```

Три базовых примитива:

- `signal(value)` — источник данных (producer), состояние;
- `computed(fn)` — производное значение (одновременно consumer и producer);
- `effect(fn)` — побочный эффект (только consumer, ничего не возвращает).

Ключевое отличие от `BehaviorSubject`: зависимости **не объявляются вручную**. Angular
запоминает их в момент выполнения функции — какие сигналы были прочитаны, те и стали
зависимостями. Именно на этом ломаются задачи `bug-in-effect` и `function-call-effect`.

### Push-then-pull

При записи Angular не пересчитывает граф сразу, а помечает зависимые узлы «грязными»
(push). Реальный пересчёт происходит при чтении (pull). Отсюда два следствия:

- `computed` **ленив**: если его никто не читает, тело не выполняется;
- промежуточных (glitch) значений не бывает — вы никогда не увидите наполовину обновлённое
  состояние, как это случается с комбинацией нескольких `BehaviorSubject`.

```ts
const firstName = signal('Ada');
const lastName = signal('Lovelace');
const fullName = computed(() => `${firstName()} ${lastName()}`);

fullName(); // 'Ada Lovelace' — вычислено и закешировано
fullName(); // из кеша, функция повторно не вызывается
```

### Равенство значений

Сигнал не уведомляет потребителей, если новое значение равно предыдущему (по умолчанию
`Object.is`). Поэтому мутировать объекты и массивы нельзя — ссылка не изменилась, значит
для сигнала «ничего не произошло»:

```ts
const users = signal<User[]>([]);

users().push(newUser); // ❌ никто не узнает об изменении
users.update((list) => [...list, newUser]); // ✅ новая ссылка
```

При необходимости функцию сравнения можно задать: `signal(value, { equal: myEqualFn })`.

---

## 2. `computed` вместо ручной синхронизации

Любое значение, которое **выводится** из другого состояния, должно быть `computed`, а не
отдельным сигналом, который кто-то не забудет обновить.

```ts
// ❌ два источника истины, легко рассинхронизировать
const items = signal<Item[]>([]);
const total = signal(0);

// ✅ один источник истины
const items = signal<Item[]>([]);
const total = computed(() => items().reduce((sum, i) => sum + i.price, 0));
```

`computed` мемоизирован, поэтому дорогое вычисление безопасно использовать в шаблоне
несколько раз — тело выполнится один раз на изменение зависимостей.

---

## 3. Сигналы в компоненте

### `input()` — задача signal-input

С Angular 17.1 вход компонента — это сигнал, а не поле, которое кто-то присваивает извне.

```ts
// было
@Input({ required: true }) name!: string;
@Input() lastName?: string;

// стало
name = input.required<string>();
lastName = input<string>(); // Signal<string | undefined>
```

Возможности функции `input`:

```ts
// значение по умолчанию — тип становится Signal<number>, без undefined
pageSize = input(20);

// alias — имя в шаблоне отличается от имени поля
value = input(0, { alias: 'sliderValue' });

// transform — преобразование значения на входе
age = input(0, { transform: numberAttribute });
disabled = input(false, { transform: booleanAttribute });
```

Что это даёт:

- вход можно читать в `computed` — и `ngOnChanges` больше не нужен;
- типы честные: `input.required` не требует `!`, а необязательный вход явно `| undefined`;
- вход доступен только для чтения — компонент не может случайно перезаписать значение
  родителя.

```ts
// вместо ngOnChanges с ручным пересчётом полей
export class UserComponent {
  name = input.required<string>();
  lastName = input<string>();
  age = input(0, { transform: numberAttribute });

  fullName = computed(() => `${this.name()} ${this.lastName() ?? ''}`);
  category = computed(() => ageToCategory(this.age()));
}
```

### `model()` и `output()`

`model()` — двусторонний вход: сигнал, который можно и читать, и писать, с автоматическим
выходом `<имя>Change` для синтаксиса `[(banana)]`:

```ts
export class CheckboxComponent {
  checked = model(false); // работает и с [(checked)], и с [(ngModel)]
}
```

`output()` — замена `@Output` + `EventEmitter` (сам по себе не сигнал, но часть того же
API):

```ts
save = output<Order>(); // this.save.emit(order)
```

### Сигнальные запросы

```ts
inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
rows = viewChildren(RowComponent); // Signal<readonly RowComponent[]>
```

В отличие от `@ViewChild`, результат — сигнал, доступный в `computed` и `effect`, без
`ngAfterViewInit` и `static: true`.

---

## 4. `effect` — и почему его почти всегда не нужно писать

`effect` выполняет побочное действие, когда изменились прочитанные им сигналы:

```ts
constructor() {
  effect(() => {
    localStorage.setItem('theme', this.theme());
  });
}
```

Правила, из которых растут обе «эффектные» задачи урока:

1. **Зависимость — это то, что было фактически прочитано в текущем прогоне.** Не то, что
   написано в коде, а то, до чего дошло выполнение.
2. Набор зависимостей пересобирается на каждом прогоне. Условия и ранние выходы могут
   «потерять» сигнал (задача `bug-in-effect`).
3. Сигнал читается не только напрямую: вызов метода сервиса, который внутри читает сигнал,
   тоже создаёт зависимость (задача `function-call-effect`).
4. `effect` создаётся в контексте внедрения зависимостей (конструктор или инициализатор
   поля) и автоматически уничтожается вместе с компонентом.
5. Первый прогон происходит не мгновенно, а при ближайшей проверке изменений: эффект
   компонента выполняется как этап жизненного цикла во время синхронизации (change
   detection), поэтому в нём уже безопасно читать входы.

Когда `effect` **не** нужен:

| Задача                                   | Правильный инструмент     |
| ---------------------------------------- | ------------------------- |
| Вычислить значение из других сигналов    | `computed`                |
| Показать значение в шаблоне              | интерполяция сигнала      |
| Синхронизировать один сигнал с другим    | `linkedSignal`            |
| Загрузить данные при изменении параметра | `resource` / `rxResource` |
| Отреагировать на действие пользователя   | обработчик события        |

`effect` уместен для того, что живёт вне графа: логирование, `localStorage`, работа с DOM
и сторонними библиотеками, аналитика.

Функцию очистки можно зарегистрировать через аргумент:

```ts
effect((onCleanup) => {
  const id = setInterval(() => poll(this.url()), 1000);
  onCleanup(() => clearInterval(id));
});
```

---

## 5. Интероп с RxJS

Сигналы не заменяют RxJS: сигнал — это состояние (текущее значение есть всегда), поток —
это события во времени (debounce, retry, отмена, гонки).

```ts
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

// Observable → Signal
user = toSignal(this.http.get<User>('/api/me')); // Signal<User | undefined>
count = toSignal(this.count$, { initialValue: 0 }); // Signal<number>
state = toSignal(this.state$, { requireSync: true }); // без undefined, но поток обязан
// отдать значение синхронно

// Signal → Observable
query$ = toObservable(this.query);
```

`toSignal` подписывается сразу при вызове и сам отписывается при уничтожении контекста —
`| async` и `takeUntilDestroyed` для этого потока больше не нужны.

---

## 6. Что делать в задачах

### 🟢 Базовый уровень

1. **signal-input** — переписать `UserComponent` на `input()` / `input.required()`, убрать
   `ngOnChanges`, вычислить `fullName` и `category` через `computed`, привести `age` к
   числу через `transform`.
2. **bug-in-effect** — объяснить (буквально словами, как джуниору) почему алерт не
   появляется при клике по второму чекбоксу, и починить. Бонус — решение через `computed`.
3. **function-call-effect** — понять, почему смена пользователя пишет лог, хотя в `effect`
   имя пользователя не читается. `UserService` менять нельзя.

### 🔴 Сложный уровень

4. **pipe-observable-to-signal** — перевести сервис и пайп на сигналы так, чтобы ни один из
   них не импортировал RxJS. Осторожно: наивный перевод «в лоб» перестанет обновлять
   таблицу.
5. **forms-and-signal** — сохранить выбранное количество при возврате с шага checkout,
   оставаясь на реактивных формах и сигналах.

Обе сложные задачи разобраны в [расширенной части](./advanced.md) — там же объясняется,
почему в них не работает прямолинейное решение.
