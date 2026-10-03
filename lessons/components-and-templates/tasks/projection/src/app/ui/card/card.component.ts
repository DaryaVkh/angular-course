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
import { CardHeaderDirective } from '../card-header/card-header.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements AfterViewInit {
  readonly list = input<any[] | null>(null);
  readonly customClass = input('');

  readonly add = output<void>();
  readonly delete = output<number>();

  @ContentChild(CardHeaderDirective)
  header?: CardHeaderDirective;

  @ViewChild("addButton")
  addButton!: ElementRef<HTMLButtonElement>;

  @ContentChild(TemplateRef)
  rowTpl?: TemplateRef<unknown>;

  ngAfterViewInit(): void {
    const e = this.addButton!.nativeElement;
    e.classList.add('flash');
    setTimeout(() => e.classList.remove('flash'), 600);
  }
}
