import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import { CardRowContext } from '../../model/card.model';
import { CardHeaderDirective } from './card-header.directive';

const FLASH_DURATION = 600;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements AfterContentInit, AfterViewInit {
  /**
   * Разметка одной строки списка задаётся конкретной карточкой
   * (teacher/student/city) — здесь она только рендерится.
   */
  @ContentChild(TemplateRef)
  protected rowTpl?: TemplateRef<CardRowContext<unknown>>;

  /** Признак того, что заголовок карточки был передан. */
  @ContentChild(CardHeaderDirective)
  private header?: CardHeaderDirective;

  @ViewChild('addButton', { static: true })
  private addButton!: ElementRef<HTMLButtonElement>;

  readonly list = input<readonly unknown[]>([]);
  readonly addItem = output<void>();

  protected readonly hasHeader = signal(false);

  protected rowContext(item: unknown, index: number): CardRowContext<unknown> {
    return { $implicit: item, index };
  }

  ngAfterContentInit(): void {
    this.hasHeader.set(!!this.header);
  }

  ngAfterViewInit(): void {
    const button = this.addButton.nativeElement;
    button.classList.add('flash');

    setTimeout(() => button.classList.remove('flash'), FLASH_DURATION);
  }
}
