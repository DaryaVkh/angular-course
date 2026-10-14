import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { Role } from './user.model';
import { UserStore } from './user.store';

export const roleGuard = (roles: Role[]): CanMatchFn => {
  return () => {
    const user = inject(UserStore).user$;

    return user.pipe(
      map((user) => {
        if (user) {
          return roles.length > 0 && roles.some((r) => user.roles.includes(r));
        }

        return false;
      }),
    );
  };
};
