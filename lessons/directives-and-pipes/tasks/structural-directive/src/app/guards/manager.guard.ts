import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { UserStore } from '../user.store';

export const managerGuard: CanMatchFn = () => {
  const user = inject(UserStore).currentUser;
  return !!user && !user.isAdmin && user.roles.includes('MANAGER');
};
