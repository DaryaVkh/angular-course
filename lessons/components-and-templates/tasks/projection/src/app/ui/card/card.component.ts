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
})
export class CardComponent<T extends { id: number }> implements AfterViewInit {
  readonly list = input<T[]>([]);
  readonly add = output<void>();

  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;
  @ContentChild(CardHeaderDirective) header?: CardHeaderDirective;
  @ContentChild(TemplateRef) rowTpl!: TemplateRef<CardRowContext<T>>;

  ngAfterViewInit(): void {
    const button = this.addButton.nativeElement;
    button.classList.add('flash');
    setTimeout(() => button.classList.remove('flash'), 600);
  }
}
