import {
  ChangeDetectionStrategy,
  Component,
  input, output,
} from '@angular/core';
import { CardType } from '../../model/card.model';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  public readonly deleteItem = output<number>();

  readonly id = input.required<number>();
  readonly name = input.required<string>();
  readonly type = input.required<CardType>();

  delete(id: number) {
    this.deleteItem.emit(id);
  }
}
