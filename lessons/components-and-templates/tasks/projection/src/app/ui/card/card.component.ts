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
import { CardHeaderDirective } from './card-header.directive';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-fit flex-col gap-3 rounded-md border-2 border-black p-4',
  },
})
export class CardComponent<T> implements AfterViewInit {
  readonly list = input<T[]>([]);
  readonly add = output<void>();

  @ContentChild(CardHeaderDirective) header?: CardHeaderDirective;
  @ContentChild(TemplateRef) rowTpl!: TemplateRef<CardRowContext<T>>;

  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    const button = this.addButton.nativeElement;
    button.classList.add('flash');
    setTimeout(() => button.classList.remove('flash'), 600);
  }
}
