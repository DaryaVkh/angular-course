import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CardType } from '../../model/card.model';
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
  readonly type = input.required<CardType>();
  readonly customClass = input('');

  readonly add = output<void>();
  readonly delete = output<number>();

  CardType = CardType;
}
