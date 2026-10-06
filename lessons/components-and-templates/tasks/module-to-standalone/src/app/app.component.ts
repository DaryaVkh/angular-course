import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './core/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, RouterOutlet],
})
export class AppComponent {}
