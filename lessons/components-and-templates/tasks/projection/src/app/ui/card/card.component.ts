import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  input,
  output,
  viewChild,
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
export class CardComponent implements AfterViewInit {
  readonly list = input<any[] | null>(null);
  readonly type = input.required<CardType>();
  readonly customClass = input('');

  readonly addItem = output();
  readonly deleteItem = output<number>();

  readonly cardHeader = contentChild('[card-header]');

  CardType = CardType;

  onAddItem() {
    this.addItem.emit();
  }

  onDeleteItem(id: number) {
    this.deleteItem.emit(id);
  }

  readonly addButton = viewChild<ElementRef>('addButton');

  ngAfterViewInit() {
    setTimeout(() => {
      this.addButton()?.nativeElement.classList.add('flash');
    }, 600);
  }
}
