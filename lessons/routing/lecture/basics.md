# Базовые знания

## Роутинг
**Роутинг** — это механизм, который связывает URL с конкретным состоянием интерфейса приложения.

Роутинг в Angular отвечает за сопоставление URL-адреса в браузере с отображаемыми компонентами без перезагрузки всей веб-страницы (иными словами почти всегда Angular приложение является SPA - Single Page Application).

Реализуется маршрутизация с использованием официального пакета `@angular/router`. Он обязательно входит в базовую конфигурацию Angular приложения.

Angular Router:
1. следит за изменением URL;
2. сопоставляет URL с конфигурацией маршрутов;
3. определяет, какие компоненты должны быть отображены;
4. создаёт/уничтожает компоненты;
5. обновляет URL браузера.

В его основе лежат routes, прописанные в ts файле, и директивы <router-outlet /> в шаблоне.

**routes** - это массив объектов, описывающих маршруты, в которых обычно точно есть path (кусочек сопоставляемого URL) и component (сопоставляемый этому URL компонент). Каждый объект — это описание одного route.

`app.routes.ts`:
```ts
const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'users',
    component: UsersComponent,
  },
];
```

**router-outlet** — это место, куда Router динамически вставляет компонент активного маршрута.

То есть для шаблона

`app.component.html`:
```html
<header>
  My application
</header>

<router-outlet></router-outlet>

<footer>
  Footer
</footer>
```

и url _"/users"_ концептуально получится

```html
<header>
  My application
</header>

<router-outlet>
  ↓
  <app-users />
</router-outlet>

<footer>
  Footer
</footer>
```

## Навигация

В Angular для внутренних переходов обычно используется базовый html-тег `<a></a>` (anchor), но в связке НЕ с атрибутом `href`, как в обычном JS приложении, а со специальным свойством `routerLink`, потому что Angular Router должен контролировать navigation lifecycle.

```html
<a routerLink="/users">
```

Общая упрощенная схема:
```
anchor element click
  ↓
RouterLink
  ↓
Router.navigate(...)
  ↓
navigation
  ↓
route matching
  ↓
component
```

Свойство `routerLink` может принимать:
- простую строку (`routerLink="/users"`),
- массив route segments (`[routerLink]="['/users', userId]"`). Это удобно для динамических маршрутов с подстановкой значений из полей компонента

### routerLinkActive

Angular умеет определить, является ли ссылка активной.

```html
<a
  routerLink="/users"
  routerLinkActive="active"
>
  Users
</a>
```

Тогда, когда текущий URL `/users`, мы получим `<a class="active"></a>`. Это полезно для стилизации и выделения активной ссылки, например, в табах или меню.

Если нужно считать ссылку активной только при точном совпадении (например, `/users`, но не `/users/1`):
```html
<a
  routerLink="/users"
  routerLinkActive="active"
  [routerLinkActiveOptions]="{
    exact: true
  }"
>
  Users
</a>
```

### Абсолютные и относительные маршруты

**Абсолютный путь** всегда начинается с `/` и отсчитывается от корня приложения. То есть если мы кликнули на ссылку с `routerLink="/users"`, находясь на URL-е `my-application.ru/home`, то в итоге окажемся на `my-application.ru/users`.

**Относительный путь** прописывается без начального `/` и отсчитывается от текущего route. То есть при клике на ссылку с `routerLink="users"`, находясь на URL-е `my-application.ru/home`, то окажемся на находясь на URL-е `my-application.ru/home/users`, что не является тем же самым, что `my-application.ru/users` и не будет матчиться с тем же компонентов (конечно если это не прописано явно). 

### Программная навигация

Не всегда навигация происходит по инициативе пользователя кликом по ссылке, иногда это необходимо сделать по условиям логики, например, в завершении какого-нибудь действия (отправка формы -> переход в реестр, успешный логин -> home page).

Для этого используется синглтон сервис `Router` из `@angular/router`. Главные методы для этого - `navigate` и `navigateByUrl`.

```ts
import { Router } from '@angular/router';

@Component(...)
export class LoginComponent {
  private router = inject(Router);

  login() {
    // login...

    this.router.navigate(['/home']);
    // или
    this.router.navigateByUrl('/home');
  }
}
```

## Router

Важная концепция: Router — дерево.

Angular Router на самом деле работает не просто со списком URL. Он строит дерево маршрутов.

```
/
│
├── users
│   │
│   ├── list
│   │
│   ├── create
│   │
│   ├── update
│   │
│   └── :id
│
└── admin
```
Это называется **Router State Tree**. Именно поэтому существуют:
- ActivatedRoute
- ActivatedRoute.parent
- ActivatedRoute.firstChild
- ActivatedRoute.children

## Route parameters

Параметры маршрута (route parameters) — это динамические сегменты в пути URL, используемые для идентификации конкретного ресурса или состояния.

Они определяются как шаблоны со знаком двоеточия (например, `users/:id`), благодаря чему один и тот же компонент или обработчик может отрисовывать разные сущности в зависимости от переданного значения.

Описываются соответственно в виде:

`app.routes.ts`:
```ts
const routes: Routes = [
  {
    path: 'users/:id',
    component: UsersComponent,
  },
];
```

Может быть несколько подряд, например, `objectCard/:entityType/:id`.

**Важно!** В конфигурации route param является обязательным и если, например, определен маршрут `users/:id`, но не определен `users`, а переход произошел именно на `users`, пути не сматчатся и будет либо переход на Not Found (если это предусмотрено конфигом приложения), либо будет ошибка.

**Важно!** Не путать route parameters с query parameters, это разные вещи.

### Как получить route parameter

Для получения значения параметра роута используется сервис ActivatedRoute.

```ts
import { ActivatedRoute } from '@angular/router';

@Component(...)
export class UserComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
  }
}
```

Для `/users/1` id будет равен `'1'`. (URL parameters всегда являются строками)

При этом параметры также можно получить двумя способами - activatedRoute.snapshot.paramMap (отдает строковое значение сразу) и activatedRoute.paramMap (отдает Observable, с помощью которого можно следить за изменением параметра и получать всегда актуальное значение при изменениях).

## Query parameters

Другой тип параметров роута - query parameters. 

Параметры строки запроса (Query Parameters) — это пары «ключ-значение», которые добавляются в конец URL-адреса после вопросительного знака ? для передачи дополнительных опциональных данных.

Пример: `/users/1?tab=info`.

В отличие от route parameters, query parameters не являются частью структуры URL и не определяют отдельный роут. 

Главное правило разделения простое: параметры маршрута (route parameters) определяют, что именно отображается на странице (сущность), а параметры строки запроса (query parameters) определяют, в каком виде или состоянии эти данные отображаются (модификаторы).

### Как получить query parameter

Для получения значения query параметра используется все тот же сервис ActivatedRoute.

```ts
import { ActivatedRoute } from '@angular/router';

@Component(...)
export class UserComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
  }
}
```

### Как передавать query parameters в routerLink

Для передачи параметров запроса через шаблон используется специальный входной инпут `[queryParams]` директивы RouterLink.

В инпут `[queryParams]` передается объект JavaScript, где ключи соответствуют именам параметров, а свойства — их значениям:
```html
<a
  [routerLink]="['/users']"
  [queryParams]="{
    tab: 'info'
  }"
>
  Users
</a>
```

При программной навигации query parameters также передается отдельным параметром, а не сразу в роуте:

```ts
this.router.navigate(
  ['/users'],
  {
    queryParams: {
      tab: 'info',
    },
  }
);
```

## Route data

В route можно передавать статические данные:

```ts
{
  path: 'users',
  component: UsersComponent,
  data: {
    title: 'Users',
    backUrl: '/home'
  },
}
```

С помощью них очень удобно хранить и передавать метаданные маршрута.

Получение:
```ts
import { ActivatedRoute } from '@angular/router';

@Component(...)
export class UserComponent {
  private route = inject(ActivatedRoute);
  
  protected readonly title$ =  this.route.data.pipe(
    map((data) => data['title'])
  );
}
```

## ActivatedRoute

`ActivatedRoute` — это не просто параметры. У него есть много полезных Observable, по которым можно отслеживать и реагировать на любые изменения в роуте:
- route.url
- route.params
- route.paramMap
- route.queryParams
- route.queryParamMap
- route.fragment
- route.data
- route.outlet
- route.routeConfig

Также (как упоминалось ранее) можно двигаться по дереву:
- route.parent
- route.firstChild
- route.children
- route.root

## Nested routes

Нередким кейсом для более-менее серьезных приложений являются вложенные пути, например, даже если брать стандартную в разработке модель CRUD:

```
/users
↓
/users/list
/users/create
/users/update/:id
/users/:id
```

В routes это будет описано примерно так:

```ts
const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent,
    children: [
      {
        path: 'list',
        component: UserListComponent,
      },
      {
        path: ':id',
        component: UserCardComponent,
      },
      {
        path: 'create',
        component: UserFormComponent,
      },
      {
        path: 'update/:id',
        component: UserFormComponent,
      },
    ],
  },
];
```

Здесь появляется очень важный момент: `children` требует своего `router-outlet`, то есть, чтобы это работало, в шаблоне `UsersComponent` должен быть свой `router-outlet`, чтобы ангуляр знал, в каком месте шаблона `UsersComponent` рендерить подходящий по path компонент.

`UsersComponent`:
```html
<h1>Users</h1>

<router-outlet />
```

Тогда для `/users/list`:

```
UsersComponent
    │
    └── router-outlet
            │
            ▼
      UserListComponent
```

## Wildcard route

Что делать, если пользователь открыл какой-то несуществующий роут, например, `/aiudfhaius`? В любом случае хорошей практикой в любом аспекте разработки является обработка возникающих ошибок, так и тут хорошо бы такой случай обрабатывать, а не падать с непонятной ошибкой. Только как?

Специальный синтаксис `path: '**'`:

```ts
{
  path: '**',
  component: NotFoundComponent,
}
```

Теперь любой неизвестный приложению роут будет отображать `NotFoundComponent` с понятным пользователю текстом.

**Важно!** `path: '**'` всегда должен быть последним, потому что Angular проверяет routes в определённом порядке.

Если у нас будет 

```ts
[
  {
    path: '**',
    component: NotFoundComponent,
  },

  {
    path: 'users',
    component: UsersComponent,
  },
]
```

То `**` перехватит любой роут раньше, чем он дойдет до матчинга с users.

## Redirect

В описании роута можно прописать редирект, например, если мы не хотим, чтобы в нашем приложении был просто маршрут `/`, и чтобы переход на `/` всегда отправлял пользователя на `/home`:

```ts
{
  path: '',
  redirectTo: 'home',
  pathMatch: 'full',
}
```

**Важно!** Зачем `pathMatch: 'full'`? Чтобы редирект происходил только если весь URL соответствует `''`. Без этого пустой path может матчиться слишком широко. Поэтому для root redirect обычно используется `pathMatch: 'full'`.

## Lazy Loading

В большом приложении не хочется загружать весь JavaScript сразу. Например, в приложении есть роуты:

```
Application
│
├── Home
├── Admin
├── Analytics
└── Settings
```

Если пользователь открыл `Analytics`, зачем ему сразу загружать и дожидаться загрузки всего остального? Может быть он остальные разделы и не планирует посещать.

Для этого используется lazy loading.

### Как реализуется?

С помощью свойств `loadComponent` для standalone компонентов и `loadChildren` для модулей и отдельных деревьев routes.

#### loadComponent

```ts
{
  path: 'settings',
  loadComponent: () =>
    import('./settings/settings.component')
      .then(m => m.SettingsComponent), 
  // или если SettingsComponent экспортирован с помощью export default:
  loadComponent: () =>
    import('./settings/settings.component'),
}
```

Тогда SettingsComponent попадет в отдельный чанк и подгрузится позже по требованию.

#### loadChildren

```ts
{
  path: 'admin',
  loadChildren: () =>
    import('./admin/admin.routes')
      .then(({ routes }) => routes),
}
```

## Resolvers

Иногда нам нужно не показывать страницу, пока необходимые данные не загрузились.

Например, для роута `/users/1` прежде чем создать страницу `UserCardComponent` нам нужно загрузить данные пользователя с id="1":

```ts
export const userResolver: ResolveFn<User> = (route) => {
  const users = inject(UserService);

  const id = route.paramMap.get('id')!;

  return users.getUser(id);
};
```

```ts
{
  path: 'users/:id',
  component: UserCardComponent,
  resolve: {
    user: userResolver,
  },
}
```

А потом получаем resolved data:

```ts
import { ActivatedRoute } from '@angular/router';

@Component(...)
export class UserCardComponent {
  private route = inject(ActivatedRoute);
  
  protected readonly user$ = this.route.data.pipe(
    map((data) => data['user'])
  );
}
```

Resolver особенно хорош, когда без данных страница практически бессмысленна. Но не стоит превращать resolver в универсальный механизм загрузки всех данных приложения. Если данные могут подгружаться после отображения UI, обычный service/store зачастую удобнее.


## Guards

Одна из самых важных встроенных возможностей Router - guards.

Guard — это механизм, который позволяет решить: "Можно ли выполнить navigation?"

Например, к роуту `/my-page` должны иметь доступ только авторизованные пользователи. Тогда можно написать:

```ts
{
  path: 'my-page',
  component: ProfileComponent,
  canActivate: [authGuard],
}
```

### Виды guards

#### canActivate

`canActivate` — это вид guard, который проверяет, разрешено ли активировать целевой маршрут и смонтировать его компонент. Он срабатывает после того, как роутер успешно нашел подходящий путь по URL, но строго до инициализации и отображения компонента.

По своей сути это функция типа CanActivateFn, которая может возвращать `boolean | UrlTree | RedirectCommand` или `Observable`/`Promise` от этих же типов:

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

Итоговая логика:
```
/my-page
       │
       ▼
   authGuard
       │
       ├── logged in ─────► Profile
       │
       └── not logged in ─► /login
```

Подтип `canActivate` - `canActivateChild`, если один guard должен закрывать каждый из `children` у определенного `path`, чтобы не прописывать canActivate у каждого объекта роута, можно прописать у родителя `canActivateChild`:
```ts
{
  path: 'admin',
  canActivateChild: [authGuard],
  children: [
    {
      path: 'users',
      component: AdminUsersComponent,
    },
    {
      path: 'settings',
      component: AdminSettingsComponent,
    },
  ],
}
```

#### canMatch

`canMatch` определяет: "Должен ли этот route вообще считаться подходящим для navigation?"

В отличие от стандартного canActivate, у `canMatch` есть две ключевые особенности в поведении:
- Паттерн «Один URL — разные компоненты»: если `canMatch` возвращает false, роутер не прерывает навигацию с ошибкой, а просто пропускает эту конфигурацию и продолжает поиск следующего подходящего маршрута в массиве Routes с таким же путем.
- Предотвращение загрузки чанков (Bundle Shielding): `canMatch` выполняется до скачивания ленивого JS-бандла (loadComponent / loadChildren). Если проверка не прошла, код бандла даже не начнет скачиваться по сети.

Очень хороший сценарий для использования `canMatch`: role-based routing + lazy loading.

```ts
import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { RoleService } from './role.service';

export const isAdminGuard: CanMatchFn = () => {
  const role = inject(RoleService);
  return role.isAdmin();
};
```

```ts
export const routes: Routes = [
  // 1. Сработает первым, только если пользователь админ
  {
    path: 'dashboard',
    canMatch: [isAdminGuard],
    loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  // 2. Если первый guard вернет false, роутер перейдет сюда
  {
    path: 'dashboard',
    loadComponent: () => import('./user-dashboard.component').then(m => m.UserDashboardComponent)
  },
];
```

#### canDeactivate

Другой интересный случай. 

`canDeactivate` - это вид guard, который проверяет, разрешено ли пользователю покинуть текущую страницу (маршрут).

Главная задача этого гарда — предотвратить потерю несохраненных данных (например, при случайном клике по ссылке во время заполнения сложной формы) или остановить уход со страницы, если на ней выполняется критический процесс.

В отличие от всех остальных гардов (`canActivate`, `canMatch`), первым аргументом в `canDeactivate` передается экземпляр текущего компонента, с которого пользователь пытается уйти. Благодаря этому гард может напрямую проверить внутреннее состояние компонента: свойства формы (form.dirty), флаги или вызвать специальный метод проверки.

Чтобы не писать отдельный гард под каждый компонент, принято объявлять общий интерфейс и один универсальный гард:

```ts
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface HasUnsavedChanges {
  canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;
}

export const pendingChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  // Если у компонента есть метод проверки, вызываем его, иначе разрешаем переход
  return component.canDeactivate ? component.canDeactivate() : true;
};
```

### Guards. Итоги

Angular guard нужен прежде всего для:

- UX;
- предотвращения ненужной навигации;
- контроля UI;
- lazy loading;
- клиентской логики доступа.

Это не security и нельзя их считать за механизм безопасности приложения, потому что JavaScript находится на клиенте, а пользователь контролирует браузер.

## Route config как архитектура приложения

Хорошая route configuration фактически описывает архитектуру:
```
/
├── auth
├── dashboard
├── users
├── orders
├── admin
└── settings
```

То есть по routes можно понять:
- какие feature существуют;
- какие feature lazy;
- какие требуют авторизации;
- какие вложены;
- где находятся boundaries приложения.

Поэтому routing — это не просто "переключение страниц".

Это часть архитектуры Angular-приложения.
