import { Routes } from '@angular/router';
import { hasRoleGuard, isAdminGuard } from './dashboard.guards';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'enter',
    canMatch: [isAdminGuard],
    loadComponent: () =>
      import('./dashboard/admin.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'enter',
    canMatch: [hasRoleGuard('MANAGER')],
    loadComponent: () =>
      import('./dashboard/manager.component').then(
        (m) => m.ManagerDashboardComponent,
      ),
  },
  { path: 'enter', redirectTo: '' },
];
