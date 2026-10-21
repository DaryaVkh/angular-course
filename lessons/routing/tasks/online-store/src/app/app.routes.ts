import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { productResolver } from './guards/product.resolver';
import { authGuard } from './guards/auth.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { adminGuard } from './guards/admin.guard';

/**
 * TODO: настройте роутинг магазина.
 *
 * Все компоненты и сервисы уже реализованы — не хватает только конфигурации
 * маршрутов, а также логики внутри guard-ов и resolver-а
 * в src/app/guards/. Полное ТЗ по каждому маршруту — в README.md этого
 * задания.
 * Краткое напоминание, что должно получиться:
 *
 *  ''                → redirect на 'catalog'
 *  'catalog'         → CatalogComponent
 *  'catalog/:id'     → ProductDetailComponent, productResolver
 *  'cart'            → CartComponent
 *  'checkout'        → CheckoutComponent, authGuard, unsavedChangesGuard
 *  'order/:orderId'  → OrderSuccessComponent
 *  'login'           → LoginComponent
 *  'profile'         → ProfileComponent, authGuard
 *  'admin'           → AdminDashboardComponent, adminGuard
 *  'admin'           → AccessDeniedComponent (fallback для не-админов)
 *   wildcard route   → NotFoundComponent
 */
export const routes: Routes = [
	{
		path: '',
		redirectTo: 'catalog',
		pathMatch: 'full',
	},
	{
		path: 'catalog',
		component: CatalogComponent,
	},
	{
		path: 'catalog/:id',
		component: ProductDetailComponent,
		resolve: {
			product: productResolver,
		},
	},
	{
		path: 'cart',
		component: CartComponent,
	},
	{
		path: 'checkout',
		component: CheckoutComponent,
		canActivate: [authGuard],
		canDeactivate: [unsavedChangesGuard],
	},
	{
		path: 'order/:orderId',
		component: OrderSuccessComponent,
	},
	{
		path: 'login',
		component: LoginComponent,
	},
	{
		path: 'profile',
		component: ProfileComponent,
		canActivate: [authGuard],
	},
	{
		path: 'admin',
		canMatch: [adminGuard],
		loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component')
			.then(m => m.AdminDashboardComponent),
	},
	{
		path: 'admin',
		loadComponent: () => import('./components/access-denied/access-denied.component')
			.then(m => m.AccessDeniedComponent),
	},
	{
		path: '**',
		component: NotFoundComponent,
	},
];
