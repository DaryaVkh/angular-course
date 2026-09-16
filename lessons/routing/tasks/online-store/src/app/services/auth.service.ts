import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppUser } from '../models/user.model';

/**
 * Константные моковые учётные записи — имитация проверки логина/пароля на бэкенде.
 * Используйте их, чтобы протестировать guard-ы:
 *   user / user123   -> обычный пользователь
 *   admin / admin123 -> администратор
 */
const MOCK_ACCOUNTS: ReadonlyArray<{ username: string; password: string; role: AppUser['role'] }> = [
  { username: 'user', password: 'user123', role: 'user' },
  { username: 'admin', password: 'admin123', role: 'admin' },
];

const NETWORK_DELAY_MS = 300;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<AppUser | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  login(username: string, password: string): Observable<AppUser> {
    const account = MOCK_ACCOUNTS.find((acc) => acc.username === username && acc.password === password);

    if (!account) {
      return throwError(() => new Error('Неверный логин или пароль')).pipe(delay(NETWORK_DELAY_MS));
    }

    const user: AppUser = { username: account.username, role: account.role };
    return of(user).pipe(delay(NETWORK_DELAY_MS));
  }

  /** Вызывайте после успешного login(), чтобы сохранить пользователя в состоянии приложения. */
  setCurrentUser(user: AppUser): void {
    this._currentUser.set(user);
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
