import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map, take } from 'rxjs';
import { Role } from './user.model';
import { UserStore } from './user.store';

export const isAdmin: CanMatchFn = () =>
  inject(UserStore).user$.pipe(
    take(1),
    map((user) => !!user?.isAdmin),
  );

export const hasRole =
  (role: Role): CanMatchFn =>
  () =>
    inject(UserStore).user$.pipe(
      take(1),
      map((user) => !!user && !user.isAdmin && user.roles.includes(role)),
    );
