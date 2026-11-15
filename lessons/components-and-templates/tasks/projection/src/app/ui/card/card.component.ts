import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [ListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly list = input<any[] | null>(null);
  readonly customClass = input('');
  
  readonly addItem = output<void>();
  readonly deleteItem = output<number>();
}