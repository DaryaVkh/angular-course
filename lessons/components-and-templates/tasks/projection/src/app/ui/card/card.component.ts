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
import { CardType } from '../../model/card.model';
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
  readonly type = input.required<CardType>();
  readonly customClass = input('');

  readonly addItem = output();

  readonly cardHeader = contentChild('[card-header]');

  CardType = CardType;

  onAddItem() {
    this.addItem.emit();
  }

  readonly rowTpl = contentChild<TemplateRef<any>>(TemplateRef);

  readonly addButton = viewChild<ElementRef>('addButton');

  ngAfterViewInit() {
    setTimeout(() => {
      this.addButton()?.nativeElement.classList.add('flash');
    }, 600);
  }
}
