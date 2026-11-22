import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../shared/ui/card/card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [CardComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
