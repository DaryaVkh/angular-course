import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { Role } from './user.model';
import { UserStore } from './user.store';

export const isAdminGuard: CanMatchFn = () =>
  inject(UserStore).user$.pipe(map((user) => !!user?.isAdmin));

export const hasRoleGuard =
  (role: Role): CanMatchFn =>
  () =>
    inject(UserStore).user$.pipe(map((user) => !!user?.roles.includes(role)));
