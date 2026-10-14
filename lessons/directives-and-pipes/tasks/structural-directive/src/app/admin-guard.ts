import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { UserStore } from './user.store';

export const adminGuard: CanMatchFn = () => {
  const user = inject(UserStore).user$;

  return user.pipe(
    map((u) => {
      return u?.isAdmin ?? false;
    }),
  );
};
