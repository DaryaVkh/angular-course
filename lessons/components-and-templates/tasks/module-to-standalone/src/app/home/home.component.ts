import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../shared/ui/card/card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, RouterLink],
})
export class HomeComponent {}
