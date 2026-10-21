import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    class: 'block rounded-md border border-gray-300 p-4 shadow-sm',
  },
})
export class CardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
