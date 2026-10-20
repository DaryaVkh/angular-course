import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserStore } from './user.store';

export const canMatchAdmin: CanMatchFn = () => {
  const userStore = inject(UserStore);

  return firstValueFrom(userStore.user$).then(
    (user) => Boolean(user && user.isAdmin),
  );
};

export const canMatchUser: CanMatchFn = () => {
  const userStore = inject(UserStore);

  return firstValueFrom(userStore.user$).then(
    (user) => Boolean(user && !user.isAdmin),
  );
};
