import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  input,
  output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CardRowContext } from '../../model/card.model';

type CardItem = unknown;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements AfterViewInit {
  readonly list = input<readonly CardItem[]>([]);
  readonly addItem = output<void>();

  protected onAddItem(): void {
    this.addItem.emit();
  }

  @ViewChild('addButton')
  private addButton?: ElementRef<HTMLButtonElement>;

  @ContentChild(TemplateRef)
  protected rowTpl!: TemplateRef<CardRowContext<unknown>>;

  ngAfterViewInit(): void {
    const button = this.addButton?.nativeElement;
    if (!button) {
      return;
    }
    button.classList.add('flash');
    setTimeout(() => {
      button.classList.remove('flash');
    }, 600);
  }

  @ContentChild('cardHeader')
  protected cardHeader?: ElementRef<HTMLElement>;
}
