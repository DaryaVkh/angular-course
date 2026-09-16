import { Routes } from '@angular/router';

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
export const routes: Routes = [];
