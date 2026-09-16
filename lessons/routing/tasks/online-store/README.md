# Angular Store

### Как запускать

```bash
npm run serve:angular-online-store
```

Приложение будет запущено на http://localhost:4200

## Информация

Вам дано почти готовое приложение — псевдо-интернет-магазин: каталог товаров, карточка товара, корзина,
оформление заказа, логин, личный кабинет и админ-панель. Все компоненты, стили и сервисы уже реализованы.
Сервисы, имитирующие бэкенд (`ProductsService`, `AuthService`, `OrdersService`), работают на константных
моковых данных и возвращают `Observable` с искусственной задержкой — как будто это настоящий HTTP-запрос.

Тестовые аккаунты для логина (см. `src/app/services/auth.service.ts`):

- `user` / `user123` — обычный покупатель;
- `admin` / `admin123` — администратор.

Чего не хватает — так это **роутинга**. Файл `src/app/app.routes.ts` пуст, а гарды и resolver
в `src/app/guards/` — это заглушки. Именно это и есть ваша задача.

## Задача

### 1. Настройте `app.routes.ts`

Нужно полностью описать маршруты приложения:

| path              | component               |
| ----------------- | ------------------------ |
| `''`               | —                        |
| `'catalog'`        | `CatalogComponent`       |
| `'catalog/:id'`     | `ProductDetailComponent` |
| `'cart'`           | `CartComponent`          |
| `'checkout'`       | `CheckoutComponent`      |
| `'order/:orderId'` | `OrderSuccessComponent`  |
| `'login'`          | `LoginComponent`         |
| `'profile'`        | `ProfileComponent`       |
| `'admin'`          | `AdminDashboardComponent`|
| `'admin'`          | `AccessDeniedComponent`  |
| `'**'`             | `NotFoundComponent`      |

Все компоненты уже есть в `src/app/components/*`.

### 2. Реализуйте guard-ы и resolver (`src/app/guards/`)

- **`auth.guard.ts`** — если `authService.isAuthenticated()`, пропускаем; иначе
  редиректим на `/login` и кладём исходный адрес в query parameter `returnUrl`, чтобы после логина
  можно было вернуться туда, откуда пришли.
- **`admin.guard.ts`** — если `authService.isAdmin()`, пропускаем; иначе возвращаем `false`,
  чтобы роутер перешёл ко второй конфигурации `'admin'` (`AccessDeniedComponent`).
- **`unsaved-changes.guard.ts`** (`canDeactivate`) — вызывает `component.hasUnsavedChanges()` (метод уже
  реализован в `CheckoutComponent`) и, если там `true`, показывает `window.confirm(...)`.
- **`product.resolver.ts`** — достаёт `:id` из `route.paramMap`, грузит товар через
  `productsService.getById(id)`. Если товар не найден — `router.navigate(['/catalog'])` и `of(null)`.

### 3. Достаньте параметры и примените их

В нескольких компонентах уже готов "скелет", но конкретное чтение параметра помечено `// TODO`:

- **`CatalogComponent`** — фильтр по категории сейчас не работает: `activeCategory` всегда `null`.
  Нужно прочитать query parameter `category` из `ActivatedRoute.queryParamMap` и применить его —
  список товаров должен реально фильтроваться.
- **`OrderSuccessComponent`** — номер заказа всегда показывает `—`. Нужно прочитать route parameter
  `orderId` из `ActivatedRoute.paramMap`.
- **`LoginComponent`** — после успешного логина всегда происходит переход на `/catalog`. Нужно прочитать
  query parameter `returnUrl` (его кладёт туда `authGuard` из пункта 2) и, если он есть, перейти по нему
  вместо `/catalog`.

## Как проверить себя

1. Открыть `/catalog` — должен редиректить `/` на `/catalog`, товары кликабельны.
2. Открыть `/catalog/headphones-a1` — должна открыться карточка товара (не "Товар не найден").
3. Открыть `/catalog/does-not-exist` — должен произойти редирект на `/catalog`.
4. Положить товар в корзину → «Оформить заказ» без логина → должно перекинуть на `/login?returnUrl=/checkout`.
5. Войти как `user` → должно вернуть обратно на `/checkout` (а не на `/catalog`).
6. Заполнить форму заказа и попытаться уйти по любой ссылке — должен появиться `confirm(...)`.
7. Отправить заказ — должен открыться `/order/<id>` с реальным номером, а кнопка «назад» не должна
   возвращать на форму чекаута.
8. Открыть `/admin`, будучи не залогиненным или залогиненным как `user` — должна показаться
   `AccessDeniedComponent` (и не должен скачаться JS-чанк админки — можно проверить во вкладке Network).
9. Выйти, войти как `admin` → `/admin` должен показать `AdminDashboardComponent`.
10. Открыть любой несуществующий путь — должна показаться страница 404.
