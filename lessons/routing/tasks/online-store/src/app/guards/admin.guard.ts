import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Требование:
 * - Если authService.isAdmin() — разрешить матчинг. Тогда Router
 *   применит конфигурацию с AdminDashboardComponent и подгрузит её lazy chunk.
 * - Если нет — вернуть false, чтобы Router пропустил эту конфигурацию и перешёл
 *   к следующей route-конфигурации с тем же path.
 */
export const adminGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return true;
};
