import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { UserStore } from './user.store';

export const adminGuard: CanMatchFn = () => {
  const user = inject(UserStore).currentUser;

  return !!user?.isAdmin;
};
