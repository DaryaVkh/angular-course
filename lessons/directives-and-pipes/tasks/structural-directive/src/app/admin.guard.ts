import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { UserStore } from './user.store';

export const adminGuard: CanMatchFn = () => {
  const userStore = inject(UserStore);

  return userStore.user$.pipe(map((user) => !!user?.isAdmin));
};
