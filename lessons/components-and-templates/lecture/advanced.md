# Расширенные знания

## @Input / @Output — продвинутые паттерны

### Signal Input (Angular 17+)

```ts
import { input, output } from '@angular/core';

@Component({ selector: 'app-user', ... })
export class UserComponent {
  name = input<string>('');            // обязательно
  age  = input.required<number>();     // required — без дефолта

  saved = output<User>();

  save(): void {
    this.saved.emit({ name: this.name(), age: this.age() });
  }
}
```

`input()` возвращает `InputSignal` — его можно использовать в `computed()` и `effect()`.  
`output()` заменяет `@Output() + EventEmitter`, но имеет более строгую типизацию.

### model() — двустороннее связывание через signal

```ts
import { model } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <button (click)="toggle()">{{ checked() }}</button>
  `,
})
export class ToggleComponent {
  checked = model(false);

  toggle(): void {
    this.checked.update((v) => !v);
  }
}
```

Родитель:

```html
<app-toggle [(checked)]="isActive" />
```

`model()` — это сокращение для `input` + `output` с паттерном `[(property)]`.

---

## ViewChild и ViewChildren

`ViewChild` даёт доступ к дочернему элементу или компоненту **из класса**.

### Доступ к DOM-элементу

```ts
@Component({
  template: `
    <input #nameInput />
  `,
})
export class FormComponent implements AfterViewInit {
  @ViewChild('nameInput') inputRef!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.inputRef.nativeElement.focus();
  }
}
```

Обращение к `inputRef` до `ngAfterViewInit` вернёт `undefined`.

### Доступ к дочернему компоненту

```ts
@ViewChild(ChildComponent) child!: ChildComponent;

ngAfterViewInit(): void {
  this.child.doSomething();
}
```

### ViewChildren — коллекция

```ts
@ViewChildren(ItemComponent) items!: QueryList<ItemComponent>;

ngAfterViewInit(): void {
  this.items.forEach(item => item.highlight());

  // Реагировать на добавление/удаление:
  this.items.changes.subscribe(() => console.log('list updated'));
}
```

---

## ContentChild и ContentChildren

Аналог ViewChild, но для контента переданного через `ng-content`.

```ts
@Component({
  selector: 'app-card',
  template: `
    <ng-content></ng-content>
  `,
})
export class CardComponent implements AfterContentInit {
  @ContentChild(IconComponent) icon!: IconComponent;
  @ContentChildren(ButtonComponent) buttons!: QueryList<ButtonComponent>;

  ngAfterContentInit(): void {
    console.log('icon:', this.icon);
    console.log('buttons count:', this.buttons.length);
  }
}
```

Родитель:

```html
<app-card>
  <app-icon />
  <app-button>Save</app-button>
  <app-button>Cancel</app-button>
</app-card>
```

Хук `ngAfterContentInit` гарантирует, что projected контент уже инициализирован.

---

## ng-content: мультислотовая проекция

Базовый `<ng-content>` принимает весь контент. `select` позволяет создавать именованные слоты.

### Атрибут select

```ts
// card.component.html
<div class="card">
  <header>
    <ng-content select="[card-title]"></ng-content>
  </header>
  <main>
    <ng-content select="[card-body]"></ng-content>
  </main>
  <footer>
    <ng-content select="[card-footer]"></ng-content>
  </footer>
  <ng-content></ng-content>  <!-- всё остальное -->
</div>
```

Родитель:

```html
<app-card>
  <h2 card-title>My Card</h2>
  <p card-body>Card content here</p>
  <button card-footer>Close</button>
</app-card>
```

`select` принимает CSS-селекторы: атрибуты (`[attr]`), классы (`.class`), теги (`p`), комбинации.

### ngProjectAs

Бывает нужно спроецировать `ng-container` как будто это другой элемент:

```html
<!-- Родитель хочет передать в слот [card-title], но обернуть в ng-container -->
<app-card>
  <ng-container ngProjectAs="[card-title]">
    <h2>Title from container</h2>
  </ng-container>
</app-card>
```

Без `ngProjectAs` `ng-container` попадёт в дефолтный слот, так как не имеет атрибута `card-title`.

### Fallback-контент (Angular 18+)

```html
<ng-content select="[card-title]">
  <span>Default Title</span>
</ng-content>
```

Если родитель не передаёт контент в этот слот, отобразится fallback.

---

## ng-template: TemplateRef и ViewContainerRef

### TemplateRef — ссылка на шаблон

`ng-template` создаёт `TemplateRef<C>` — дескриптор шаблона без рендера.  
Можно получить через `@ViewChild`:

```ts
@Component({
  template: `
    <ng-template #tpl let-item>
      <li>{{ item.name }}</li>
    </ng-template>
  `,
})
export class MyComponent {
  @ViewChild('tpl') tpl!: TemplateRef<{ $implicit: Item }>;
}
```

### ViewContainerRef — место для рендера

`ViewContainerRef` — точка вставки во view-дерево Angular. Позволяет программно создавать embedded views и компоненты.

```ts
@Component({
  template: `
    <ng-container #anchor></ng-container>
  `,
})
export class DynamicComponent {
  @ViewChild('anchor', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('tpl') tpl!: TemplateRef<{ $implicit: string }>;

  render(): void {
    this.container.clear();
    this.container.createEmbeddedView(this.tpl, { $implicit: 'Hello' });
  }
}
```

`createEmbeddedView(templateRef, context)` — рендерит `ng-template` с переданным контекстом.

### Передача контекста в ng-template

```html
<ng-template #rowTpl let-row let-index="index">
  <tr>
    <td>{{ index + 1 }}</td>
    <td>{{ row.name }}</td>
  </tr>
</ng-template>

<ng-container *ngTemplateOutlet="rowTpl; context: { $implicit: user, index: i }"></ng-container>
```

- `let-row` — привязывается к `$implicit` (ключ по умолчанию)
- `let-index="index"` — привязывается к полю `index` контекстного объекта

---

## ng-container: продвинутые сценарии

### ng-container как точка ngTemplateOutlet

```html
<ng-container [ngTemplateOutlet]="myTpl" [ngTemplateOutletContext]="{ $implicit: data }"></ng-container>
```

Полная форма без синтаксического сахара `*`. Разворачивается в то же самое, что и `*ngTemplateOutlet`.

---

## Динамические компоненты

`ViewContainerRef.createComponent()` позволяет создать компонент программно — например, для модальных окон, тостов, динамических форм.

```ts
@Component({
  template: `
    <ng-container #host></ng-container>
  `,
})
export class HostComponent {
  @ViewChild('host', { read: ViewContainerRef }) host!: ViewContainerRef;

  showToast(message: string): void {
    this.host.clear();
    const ref = this.host.createComponent(ToastComponent);
    ref.instance.message = message;
    ref.instance.closed.subscribe(() => ref.destroy());
  }
}
```

`ComponentRef.instance` — это экземпляр созданного класса компонента.  
`ComponentRef.destroy()` — удаляет компонент из DOM и вызывает `ngOnDestroy`.

### Передача @Input через setInput

```ts
const ref = this.host.createComponent(ToastComponent);
ref.setInput('message', 'Hello!'); // type-safe способ, работает с signal inputs
```

---

## @defer — отложенная загрузка блока (Angular 17+)

`@defer` позволяет лениво загружать часть шаблона и её зависимости — компоненты, директивы, пайпы.

```html
@defer (on viewport) {
<app-heavy-chart [data]="chartData" />
} @placeholder {
<div class="skeleton"></div>
} @loading (minimum 300ms) {
<app-spinner />
} @error {
<p>Failed to load chart</p>
}
```

### Триггеры

| Триггер          | Когда рендерит                     |
| :--------------- | :--------------------------------- |
| `on idle`        | когда браузер простаивает (дефолт) |
| `on viewport`    | когда блок попадает в видимую зону |
| `on interaction` | при клике/фокусе на placeholder    |
| `on hover`       | при наведении                      |
| `on timer(2s)`   | через указанное время              |
| `when condition` | когда выражение становится `true`  |
| `on immediate`   | сразу при рендере страницы         |

### prefetch

```html
@defer (on interaction; prefetch on hover) {
<app-user-details />
}
```

Загрузка JS-бандла начнётся при hover, а рендер — только при клике.

---

## Host: привязки к элементу самого компонента

`host` в `@Component` (или декораторы `@HostBinding` / `@HostListener`) управляют поведением корневого элемента компонента.

### Через metadata (предпочтительный способ)

```ts
@Component({
  selector: 'app-button',
  template: `
    <ng-content></ng-content>
  `,
  host: {
    '[class.active]': 'isActive',
    '[attr.disabled]': 'disabled || null',
    '(click)': 'onClick($event)',
    role: 'button',
  },
})
export class ButtonComponent {
  @Input() isActive = false;
  @Input() disabled = false;

  onClick(event: MouseEvent): void {
    if (this.disabled) event.stopPropagation();
  }
}
```

### Через декораторы

```ts
@HostBinding('class.active') get isActive() { return this.active; }
@HostListener('mouseenter') onEnter() { this.active = true; }
@HostListener('mouseleave') onLeave() { this.active = false; }
```

---

## Template Reference Variables (#ref)

Переменная `#ref` создаёт ссылку на элемент или директиву прямо в шаблоне.

### Ссылка на DOM-элемент

```html
<input #email type="email" />
<button (click)="submit(email.value)">Submit</button>
```

### Ссылка на компонент

```html
<app-form #form />
<button (click)="form.reset()">Reset</button>
```

---

## Сравнение расширенное

| Механизм           | Рендерится    | Создаёт DOM | Программный контроль | Основное применение             |
| :----------------- | :------------ | :---------- | :------------------- | :------------------------------ |
| `ng-content`       | сразу         | нет         | нет                  | content projection (слоты)      |
| `ng-template`      | по требованию | нет         | да (TemplateRef)     | шаблоны, структурные директивы  |
| `ng-container`     | сразу         | нет         | нет                  | группировка без обёртки         |
| `ViewContainerRef` | по требованию | нет         | да                   | динамические компоненты и views |
| `@defer`           | по триггеру   | да          | через триггеры       | lazy loading частей шаблона     |
