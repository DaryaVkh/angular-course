import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { UserStore } from '../user.store';

export const managerGuard: CanMatchFn = () =>
  inject(UserStore).user$
    .pipe(map(user => user?.roles.includes('MANAGER') === true));
