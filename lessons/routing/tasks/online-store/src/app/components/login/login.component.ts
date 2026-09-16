import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(event: Event): void {
    event.preventDefault();
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.username(), this.password()).subscribe({
      next: (user) => {
        this.authService.setCurrentUser(user);

        // TODO: сейчас после логина мы всегда переходим на /catalog.
        // Достаньте query parameter `returnUrl` из
        // this.route.snapshot.queryParamMap и, если он есть, перейдите по
        // нему вместо /catalog (важно: страница
        // логина не осталась в истории браузера).
        this.router.navigate(['/catalog'], { replaceUrl: true });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Неверный логин или пароль');
      },
    });
  }
}
