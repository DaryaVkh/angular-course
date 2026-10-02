import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../shared/ui/card/card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
