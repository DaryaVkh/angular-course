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

---

## Module vs Standalone

Angular изначально строился вокруг концепции **NgModule** — модулей, которые объединяют компоненты, директивы, пайпы и сервисы в логические блоки. Начиная с **Angular 14** (экспериментально) и окончательно с **Angular 15+** (стабильно), а с **Angular 17** — как **дефолтный подход в CLI**, появилась альтернатива: **standalone-компоненты**, которые могут существовать без NgModule вообще.

Понимание обеих концепций важно, потому что:
- Огромное количество существующих проектов написано на модулях.
- Новые проекты (Angular 17+) генерируются как standalone по умолчанию.
- Часто приходится работать в гибридных проектах (миграция).

### NgModule — классический подход

#### Что такое NgModule

`NgModule` — это класс с декоратором `@NgModule`, который группирует связанные части приложения и описывает, как Angular должен их компилировать и связывать друг с другом.

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### Ключевые метаданные

| Свойство | Назначение |
|---|---|
| `declarations` | Компоненты, директивы и пайпы, принадлежащие этому модулю |
| `imports` | Другие модули, чей публичный API (экспортированные сущности) нужен этому модулю |
| `exports` | Что из `declarations`/`imports` доступно модулям, которые импортируют этот модуль |
| `providers` | Сервисы, регистрируемые в DI на уровне модуля |
| `bootstrap` | Корневой компонент, с которого начинается рендер (только в корневом модуле) |

#### Типы модулей

**Корневой модуль (`AppModule`)** — запускает приложение:

```typescript
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

Также является core-модулем, в котором определяются синглтон сервисы, guard-ы, интерсепторы.

**Фичевые модули (Feature Modules)** — инкапсулируют функциональность:

```typescript
@NgModule({
  declarations: [UserListComponent, UserCardComponent],
  imports: [CommonModule, RouterModule.forChild(userRoutes)],
  exports: [UserListComponent]
})
export class UserModule { }
```

**Shared-модули** — переиспользуемые компоненты/пайпы/директивы:

```typescript
@NgModule({
  declarations: [HighlightDirective, TruncatePipe],
  imports: [CommonModule],
  exports: [HighlightDirective, TruncatePipe, CommonModule]
})
export class SharedModule { }
```

#### Ленивая загрузка модулей (Lazy Loading)

```typescript
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  }
];
```

Это одно из главных преимуществ модульной системы — деление бандла по фичам.

#### Проблемы модульного подхода

- **Бойлерплейт**: даже маленький компонент требует создания/правки модуля.
- **Скрытые зависимости**: чтобы понять, что доступно компоненту, нужно смотреть весь граф `imports`/`exports` модуля.
- **Сложность для новичков**: непонятно, зачем нужен ещё один слой абстракции поверх компонентов.
- **Циклические зависимости** между модулями иногда трудно отследить.

---

### Standalone-компоненты — новый подход

#### Идея

Standalone-компонент (директива, пайп) **сам объявляет свои зависимости** через свойство `imports` прямо в декораторе `@Component`, без необходимости в промежуточном `NgModule`.

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-card',
  standalone: true, // с Angular 19 это значение по умолчанию, можно не писать
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card">
      <h3>{{ user.name }}</h3>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  readonly user = { id: 1, name: 'Анна' };
}
```

Обратите внимание:
- `standalone: true` — говорит Angular, что компонент не принадлежит никакому `NgModule`.
- `imports: [...]` — сюда попадают **другие standalone-компоненты, директивы, пайпы или целые NgModule** (для обратной совместимости импортировать классический модуль тоже можно).

#### Запуск standalone-приложения

Вместо `bootstrapModule` используется `bootstrapApplication`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
```

Здесь нет `AppModule` вообще. Приложение — это просто дерево standalone-компонентов, а глобальные сервисы настраиваются через функции `provideSomething()`.

#### Standalone директивы и пайпы

```typescript
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @HostBinding('style.backgroundColor') color = 'yellow';
}

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 20): string {
    return value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
```

Их так же подключают через `imports` в компоненте, который их использует.

#### Ленивая загрузка standalone-компонентов

Вместо `loadChildren` с модулем — `loadComponent` с компонентом:

```typescript
const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/user-list.component').then(c => c.UserListComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];
```

Файл с дочерними роутами (`admin.routes.ts`) — это просто массив `Routes`, без модуля:

```typescript
export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'settings', component: AdminSettingsComponent }
];
```

---

### Совместное использование standalone и NgModule

Angular спроектировал переход так, чтобы оба подхода были совместимы.

#### Standalone-компонент внутри NgModule-приложения

Можно импортировать standalone-компонент прямо в `imports` обычного модуля:

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StandaloneWidgetComponent // standalone-компонент импортируется как модуль
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### NgModule внутри standalone-компонента

Аналогично, старый модуль можно подключить в `imports` standalone-компонента:

```typescript
@Component({
  standalone: true,
  imports: [LegacyMaterialModule], // старый NgModule
  selector: 'app-root',
  template: `...`
})
export class AppComponent {}
```

Это ключевая возможность для **постепенной миграции**: не нужно переписывать всё приложение разом.

---

## 5. Сравнительная таблица

| Аспект | NgModule | Standalone                                                           |
|---|---|----------------------------------------------------------------------|
| Точка входа | `bootstrapModule(AppModule)` | `bootstrapApplication(AppComponent)`                                 |
| Объявление зависимостей | `declarations` в модуле | `imports` прямо в компоненте                                         |
| Глобальные провайдеры | `providers` в `AppModule` | массив `providers` в `bootstrapApplication`, функции `provideSmth()` |
| Ленивая загрузка | `loadChildren` → модуль | `loadComponent` (компонент) / `loadChildren` → массив `Routes`       |
| Бойлерплейт | Больше (нужен файл модуля) | Меньше                                                               |
| Явность зависимостей | Нужно смотреть модуль | Видно прямо в компоненте                                             |
| CLI по умолчанию (Angular 17+) | Нет (нужно `--standalone=false`) | Да                                                                   |
| Поддержка | Полная, актуальна | Полная, рекомендуемый путь развития                                  |

---

### Миграция существующего проекта

Angular предоставляет автоматизированную схематику:

```bash
ng generate @angular/core:standalone
```

Она выполняется в несколько проходов:
1. Конвертация компонентов/директив/пайпов в `standalone: true`.
2. Удаление ставших ненужными `NgModule`.
3. Замена `bootstrapModule` на `bootstrapApplication`.

После автоматической миграции рекомендуется вручную пройтись по коду и заменить `CommonModule` точечными импортами (`NgIf`, `NgFor` и т.д., либо оставить `CommonModule` для простоты).

---

### Когда что использовать

**Используйте standalone, если:**
- Начинаете новый проект (Angular 17+ это дефолт).
- Хотите минимизировать бойлерплейт и явно видеть зависимости каждого компонента.
- Планируете гранулярный lazy-loading на уровне отдельных компонентов.

**NgModule всё ещё уместен, если:**
- Работаете в большом legacy-проекте, где миграция дорога.
- Используете сторонние библиотеки, которые ещё построены вокруг `forRoot()/forChild()` паттернов модулей (хотя большинство актуальных версий популярных библиотек, включая Angular Material, уже поддерживают standalone).

---

### Итоги

- **NgModule** — исторический, но всё ещё поддерживаемый механизм группировки функциональности через `declarations/imports/exports/providers`.
- **Standalone** — современный подход, где каждый компонент, директива и пайп самодостаточны и явно объявляют свои зависимости через `imports`.
- Оба подхода **полностью совместимы** между собой, что позволяет мигрировать постепенно.
- С Angular 17 standalone — это путь по умолчанию для новых проектов, и Angular team рекомендует именно его для нового кода.
