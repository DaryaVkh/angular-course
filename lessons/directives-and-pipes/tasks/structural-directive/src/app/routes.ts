import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { UserStore } from './user.store';

const isAdminGuard: CanMatchFn = () => {
  const userStore = inject(UserStore);
  return userStore.user$.pipe(map((user) => !!user?.isAdmin));
};

const isManagerGuard: CanMatchFn = () => {
  const userStore = inject(UserStore);
  return userStore.user$.pipe(map((user) => !!user?.roles.includes('MANAGER')));
};

export const APP_ROUTES = [
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
    canMatch: [isManagerGuard],
    loadComponent: () =>
      import('./dashboard/manager.component').then(
        (m) => m.ManagerDashboardComponent,
      ),
  },
];
