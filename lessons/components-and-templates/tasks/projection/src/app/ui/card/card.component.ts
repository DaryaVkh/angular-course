import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  input,
  output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CardRowContext } from '../../model/card.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  host: {
    class: 'flex w-fit flex-col gap-3 rounded-md border-2 border-black p-4',
    '[class]': 'customClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent<T> implements AfterViewInit {
  readonly list = input<T[] | null>(null);
  readonly customClass = input('');

  readonly addNewItem = output();

  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;
  @ContentChild('cardHeader') cardHeader?: ElementRef<HTMLElement>;
  @ContentChild(TemplateRef) rowTpl!: TemplateRef<CardRowContext<T>>;

  ngAfterViewInit(): void {
    this.addButton.nativeElement.classList.add('flash');
    setTimeout(
      () => this.addButton.nativeElement.classList.remove('flash'),
      600,
    );
  }
}
