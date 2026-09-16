import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Требование:
 * - Если пользователь авторизован (authService.isAuthenticated()) — разрешить
 *   переход, вернув true.
 * - Если не авторизован — перенаправить на /login, сохранив исходный адрес
 *   в query parameter `returnUrl` (LoginComponent должен использовать его,
 *   чтобы вернуть пользователя туда, откуда он пришёл).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return true;
};
