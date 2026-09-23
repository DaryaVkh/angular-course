import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-city-card',
  templateUrl: './city-card.component.html',
  styleUrl: './city-card.component.scss',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityCardComponent {}
