# Module to Standalone

## Run Application

```bash
npm run serve:angular-module-to-standalone
```

Приложение будет запущено на http://localhost:4200

## Documentation and Instruction

## Информация

Standalone-компоненты появились в Angular 14, стали стабильными в Angular 15, а с Angular 19 `standalone: true` — значение по умолчанию. Поэтому в этом приложении у всех компонентов, директив и пайпов явно указано `standalone: false` — без этого их нельзя было бы объявить в `NgModule`.

Приложение «Библиотека» целиком построено на модулях:

- `AppModule` + `AppRoutingModule` — корневой модуль и роутинг, bootstrap через `platformBrowserDynamic().bootstrapModule(...)`;
- `CoreModule` — `NavbarComponent` и `NotFoundComponent`;
- `SharedModule` — `CardComponent`, директива `appHighlight`, пайп `truncate` (+ реэкспорт `CommonModule`);
- `HomeModule` — главная страница;
- `BooksModule` + `BooksRoutingModule` — лениво загружаемый раздел книг, использует `FormsModule` и предоставляет `BooksService` через `providers`;
- `AuthorsModule` + `AuthorsRoutingModule` — лениво загружаемый раздел авторов.

## Задача

Перевести приложение с NgModule на standalone API так, чтобы в проекте не осталось ни одного `@NgModule`, а внешний вид и поведение приложения не изменились.

## Пункты задания:

- Сделайте все компоненты, директивы и пайпы standalone (уберите `standalone: false`). Каждый компонент должен сам импортировать то, что использует в шаблоне: `CardComponent`, `HighlightDirective`, `TruncatePipe`, `RouterLink`, `RouterLinkActive`, `RouterOutlet`, `FormsModule` и т.д.
- Удалите `SharedModule`, `CoreModule`, `HomeModule`. Подумайте, что делать с `CommonModule`, который реэкспортировал `SharedModule`: какие из его частей реально нужны.
- Замените `AppModule` на `bootstrapApplication(AppComponent, appConfig)`. Вынесите провайдеры в `app.config.ts` (`provideZoneChangeDetection`, `provideRouter`).
- Замените `AppRoutingModule` на массив `routes` в `app.routes.ts` и `provideRouter(routes, withComponentInputBinding())` — вместо `bindToComponentInputs: true`.
- Замените `BooksRoutingModule`/`AuthorsRoutingModule` на файлы `books.routes.ts`/`authors.routes.ts`, а `loadChildren` в корневом роутинге — на загрузку массива маршрутов (`import('./books/books.routes').then(m => m.BOOKS_ROUTES)`).
- `BooksService` сейчас предоставляется в `BooksModule`. Сохраните его область видимости: перенесите его в `providers` родительского маршрута `books` (а не в `providedIn: 'root'`). Проверьте, что сервис по-прежнему создаётся только при переходе в раздел книг.
- (*) Для маршрута `authors` используйте `loadComponent` вместо `loadChildren`, раз в разделе всего одна страница.

## Проверка

- `grep -r "NgModule" src` ничего не находит.
- Все страницы (`/`, `/books`, `/books/1`, `/authors`, несуществующий адрес) работают как раньше; поиск по книгам, подсветка карточек при наведении и обрезка текста пайпом сохранились.

## Ограничения

- Делайте перенос вручную, а не с помощью автоматической миграции.
