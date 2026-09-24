import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CardRowContext } from '../../model/card.model';
import { CardHeaderComponent } from './card-header.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-fit flex-col gap-3 rounded-md border-2 border-black p-4',
    '[class.hasHeader]': 'header()',
  },
})
export class CardComponent<T extends { id: number }> implements AfterViewInit {
  readonly list = input<T[] | null>(null);
  readonly addOne = output<void>();

  readonly addButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('addButton');

  readonly listItemTemplate =
    contentChild.required<TemplateRef<CardRowContext<T>>>(TemplateRef);

  readonly header = contentChild(CardHeaderComponent);

  ngAfterViewInit(): void {
    this.addButton().nativeElement.classList.add('flash');
    setTimeout(
      () => this.addButton().nativeElement.classList.remove('flash'),
      600,
    );
  }
}
