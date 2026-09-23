import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    class: 'block rounded-md border border-gray-300 p-4 shadow-sm',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
