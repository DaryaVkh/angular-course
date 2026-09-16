# Projection

> author: thomas-laforge

### Run Application

```bash
npm run serve:angular-projection
```

Приложение будет запущено на http://localhost:4200

## Documentation and Instruction

### Информация

Content projection в Angular - это мощная техника для создания компонентов с гибко настраиваемым внешним видом. Понимание и использование концепций ng-content и ngTemplateOutlet может значительно вам помочь создавать компоненты, предназначенные для повторного использования.

[Здесь]() вы можете изучить все о ng-content, начиная с простых примеров и до более сложных.

Документацию ngTemplateOutlet вместе с базовыми примерами можно найти [тут](https://angular.dev/api/common/NgTemplateOutlet).

`ViewChild`/`ViewChildren` дают доступ из класса компонента к элементам и компонентам его собственного шаблона. `ContentChild`/`ContentChildren` — аналог, но для контента, спроецированного через `ng-content`. 

`ng-template` вместе с `TemplateRef` и `ngTemplateOutlet` позволяет родителю передать в дочерний компонент кусок разметки, которым тот сам не управляет, — без `@if`/`@switch` и без знания структуры этой разметки.

### Пояснение

Вы начнете с полностью работающего приложения, в котором есть карточки учителя и студента. Цель состоит в том, чтобы реализовать карточку города.

Хотя приложение работает, его внутреннее устройство далеко от идеала. Каждый раз, когда нужно будет реализовать новую карточку, вам придется изменять card.component.ts. В реальных проектах этот компонент может использоваться во многих приложениях. Цель этого упражнения создать CardComponent, внешний вид которого можно настроить без каких-либо изменений. После того как вы создадите этот компонент, вы можете создать CityCardComponent без модификации CardComponent.

### Пункты задания

- Провести рефакторинг CardComponent и ListItemComponent:
  - Цикл @for должен оставаться внутри CardComponent, несмотря на возможное желание перенести его в ParentCardComponent
  - CardComponent не должен содержать NgIf или NgSwitch.
  - CSS: избегайте использования ::ng-deep. Ищите альтернативные способы стилизации с помощью CSS.
- В `CardComponent` добавьте template reference variable `#addButton` на кнопку "Add" и `@ViewChild('addButton')`. В `ngAfterViewInit` один раз навесьте класс `flash` на `nativeElement` кнопки (и снимите его через `setTimeout`, например 600мс) — при загрузке страницы кнопка "Add" должна один раз мигнуть синим.
- Добавьте в `CardComponent` именованный слот `<ng-content select="[card-header]"></ng-content>` перед списком элементов и `@ContentChild` с тем же селектором. С помощью `[class.has-header]` на контейнере покажите отступ/разделитель, если заголовок был передан. Прокиньте заголовок (`<h3 card-header>Учителя</h3>` / `<h3 card-header>Студенты</h3>`) из `TeacherCardComponent` и `StudentCardComponent`, а для `CityCardComponent` слот оставьте пустым — карточка города не должна визуально сломаться.
- (*) Уберите из `CardComponent` прямой импорт и использование `<app-list-item>`. Вместо этого пусть `TeacherCardComponent`, `StudentCardComponent` и `CityCardComponent` передают собственный `<ng-template let-item let-i="index">` с разметкой строки списка, а `CardComponent` получает его через `@ContentChild(TemplateRef)` и рендерит внутри своего `@for` через `<ng-container *ngTemplateOutlet="rowTpl; context: { $implicit: item, index: i } as CardRowContext<T>">`. После этого `CardComponent` не должен знать ни о `ListItemComponent`, ни о структуре City/Student/Teacher — визуально список должен остаться прежним, но верстку строки теперь определяет каждая конкретная карточка.
