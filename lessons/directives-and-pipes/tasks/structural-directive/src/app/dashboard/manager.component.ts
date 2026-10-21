import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '../button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonComponent, RouterLink],
  template: `
    <p>dashboard for Manager works!</p>
    <button app-button routerLink="/">Logout</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagerDashboardComponent {}
