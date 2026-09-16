# Базовые знания

## Что такое компоненты в Angular

Angular построен вокруг идеи компонентной архитектуры.  
Интерфейс приложения разбивается на независимые блоки, каждый из которых отвечает только за свою часть UI.

Компонент — это комбинация:

- логики
- шаблона
- настроек компонента

Простейший компонент:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <h2>{{ name }}</h2>
  `,
})
export class UserComponent {
  name = 'Darya';
}
```

---

## Из чего состоит компонент

### 1. Class

Содержит бизнес-логику (данные и методы):

```ts
export class UserComponent {
  name = 'Darya';

  changeName(): void {
    this.name = 'Alex';
  }
}
```

---

### 2. Template

Определяет HTML интерфейс.

```html
<h2>Name: {{ name }}</h2>

<button (click)="changeName()">Change name</button>
```

---

### 3. Metadata

Настройки внутри `@Component`.

```ts
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

Основные свойства:

- `selector` - HTML-тег компонента, с помощью которого его потом можно использовать в шаблонах других компонентов
- `template` - inline HTML (используется редко, когда шаблон очень маленький)
- `templateUrl` - путь к файлу с HTML компонента (используется чаще, так как это более "чистый подход")
- `styles` - inline CSS (используется редко, когда стилей очень мало)
- `styleUrl`/`styleUrls` - путь к файлу/файлам со стилями (используется чаще)

### Жизненный цикл компонента

Это последовательность этапов от создания компонента до его полного удаления, управляемая специальными методами (хуками).

Основные стадии включают инициализацию, проверку изменений, обновление данных, работу с представлением и уничтожение.

Основные хуки жизненного цикла в порядке вызова:

- `constructor()`: Инициализация класса (не является хуком Angular, но выполняется первым).
- `ngOnChanges()`: Вызывается при изменении входных данных (@Input).
- `ngOnInit()`: Вызывается один раз после первой инициализации компонента (здесь рекомендуется получать данные).
- `ngDoCheck()`: Вызывается при каждой проверке изменений, позволяет реализовать собственную логику обнаружения.
- `ngAfterContentInit()`: После инициализации контента (ng-content).
- `ngAfterContentChecked()`: После проверки контента.
- `ngAfterViewInit()`: После инициализации представления компонента и дочерних компонентов.
- `ngAfterViewChecked()`: После проверки представления.
- `ngOnDestroy()`: Вызывается перед удалением компонента для очистки ресурсов (таймеры, подписки).Компонент проходит через эти этапы при обновлении данных или переключении страниц.

---

## Взаимодействие компонентов

### @Input — передача данных в компонент

`@Input` позволяет родительскому компоненту передавать данные в дочерний.

**child.component.ts**:

```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
    <p>Hello, {{ name }}!</p>
  `,
})
export class ChildComponent {
  @Input() name = '';
}
```

**parent.component.html**:

```html
<app-child [name]="username" />
```

**parent.component.ts**:

```ts
username = 'Darya';
```

Без `[]` в атрибуте передастся строка `"username"`, а не значение переменной.

Можно задать псевдоним, если нужно, чтобы имя свойства в шаблоне отличалось от имени внутри класса:

```ts
@Input('userId') id = '';
```

```html
<app-child [userId]="currentId" />
```

---

### @Output — передача событий из компонента

`@Output` позволяет дочернему компоненту отправлять события родителю через `EventEmitter`.

**child.component.ts**:

```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
    <button (click)="handleClick()">Click me</button>
  `,
})
export class ChildComponent {
  @Output() clicked = new EventEmitter<string>();

  handleClick(): void {
    this.clicked.emit('Hello from child!');
  }
}
```

**parent.component.html**:

```html
<app-child (clicked)="onChildClick($event)" />
```

**parent.component.ts**:

```ts
onChildClick(message: string): void {
  console.log(message); // 'Hello from child!'
}
```

`$event` в шаблоне родителя — это значение, переданное в `emit()`.

---

### @Input и @Output вместе

Типичный пример — компонент счётчика, который получает начальное значение и сообщает об изменениях:

**counter.component.ts**:

```ts
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{ count }}</span>
    <button (click)="increment()">+</button>
  `,
})
export class CounterComponent {
  @Input() count = 0;
  @Output() countChange = new EventEmitter<number>();

  increment(): void {
    this.count++;
    this.countChange.emit(this.count);
  }

  decrement(): void {
    this.count--;
    this.countChange.emit(this.count);
  }
}
```

**parent.component.html**:

```html
<app-counter [count]="value" (countChange)="value = $event" />
<p>Current value: {{ value }}</p>
```

---

## Шаблоны (Templates)

### Что такое template

Template — это HTML с Angular-синтаксисом.

Angular позволяет:

- выводить данные
- слушать события
- управлять DOM
- рендерить элементы по условиям

Пример:

```html
<p>{{ counter }}</p>

<button (click)="increase()">+</button>

@if (counter > 0) {
<button (click)="decrease()">-</button>
}
```

### Data binding

Data Binding связывает компонент и шаблон.

В Angular существует 4 основных типа binding:

1. Интерполяция - вывод значения в HTML.

**user.component.html**:

```html
<p>{{ username }}</p>
```

**user.component.ts**:

```ts
username = 'Darya';
```

2. Property Binding - передача значения в HTML-атрибут.

**user.component.html**:

```html
<img [src]="avatarUrl" />
```

**user.component.ts**:

```ts
avatarUrl = 'assets/avatar.png';
```

Важно! Без `[]` в `src` подставится обычная строка `"avatarUrl"`, а с `[]` - значение поля `avatarUrl`.

3. Event Binding - обработка событий.

**user.component.html**:

```html
<button (click)="sayHello()">Click</button>
```

**user.component.ts**:

```ts
sayHello(): void {
  console.log('Hello');
}
```

4. Two-Way Binding - двусторонняя синхронизация.

**user.component.html**:

```html
<input [(ngModel)]="name" />

<p>{{ name }}</p>
```

**user.component.ts**:

```ts
name = '';
```

В основном используется с атрибутом `ngModel` из модуля `FormsModule`.

В данном примере: когда пользователь вводит текст, input обновляет компонент, а компонент обновляет template.

### ng-content

`ng-content` позволяет вставлять контент внутрь компонента.

Родитель:

```html
<app-card>
  <p>Hello world</p>
</app-card>
```

Дочерний компонент (app-card):

```html
<div class="card">
  <ng-content></ng-content>
</div>
```

Результат:

```html
<div class="card">
  <p>Hello world</p>
</div>
```

## ng-template

`ng-template` - это скрытый шаблон. Он не рендерится автоматически. Самые частые кейсы для использования - использование в блоке else у *ngIf и передача в *ngTemplateOutlet.

```html
<ng-template>
  <p>Hello</p>
</ng-template>
```

Использование с \*ngIf:

```html
<div *ngIf="isLoading; else content">Loading...</div>

<ng-template #content>
  <p>Data loaded</p>
</ng-template>
```

Использование с \*ngTemplateOutlet:

```html
<ng-template #userTpl let-user>
  <p>{{ user.name }}</p>
</ng-template>

<ng-container *ngTemplateOutlet="userTpl; context: { $implicit: currentUser }"></ng-container>
```

## ng-container

`ng-container` не создает DOM-элемент. Это "пустая коробка". Самый частый кейс использования - использование с \*ngIf для группировки нескольких тегов на одном уровне вложенности.

```html
<ng-container *ngIf="isVisible">
  <p>Hello</p>
  <p>World</p>
</ng-container>
```

В итоге в DOM отрендерятся только параграфы (p).

## Сравнение: ng-content vs ng-template vs ng-container

| Feature           | ng-content | ng-template | ng-container |
| :---------------- | :--------- | :---------- | :----------- |
| Рендер сразу      | ✅         | ❌          | ✅           |
| Добавляет DOM     | ❌         | ❌          | ❌           |
| Переиспользование | ❌         | ✅          | ❌           |
| Контекст          | ❌         | ✅          | ❌           |
| Назначение        | projection | шаблон      | grouping     |
