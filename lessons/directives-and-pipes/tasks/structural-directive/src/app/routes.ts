import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { Role } from './user.model';
import { UserStore } from './user.store';

const isAdmin: CanMatchFn = () =>
  inject(UserStore).user$.pipe(map((user) => !!user?.isAdmin));

const hasRole =
  (role: Role): CanMatchFn =>
  () =>
    inject(UserStore).user$.pipe(
      map((user) => !!user?.roles.includes(role)),
    );

export const APP_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'enter',
    canMatch: [isAdmin],
    loadComponent: () =>
      import('./dashboard/admin.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'enter',
    canMatch: [hasRole('MANAGER')],
    loadComponent: () =>
      import('./dashboard/manager.component').then(
        (m) => m.ManagerDashboardComponent,
      ),
  },
];
