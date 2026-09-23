import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [ListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-fit flex-col gap-3 rounded-md border-2 border-black p-4',
  },
})
export class CardComponent<T extends { id: number }> implements AfterViewInit {
  readonly list = input<T[] | null>(null);
  readonly getName = input.required<(item: T) => string>();

  readonly addOne = output<void>();
  readonly deleteOne = output<number>();

  readonly addButton = viewChild<ElementRef<HTMLButtonElement>>('addButton');

  ngAfterViewInit(): void {
    this.addButton()?.nativeElement.classList.add('flash');
    setTimeout(
      () => this.addButton()?.nativeElement.classList.remove('flash'),
      600,
    );
  }
}
