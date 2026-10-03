import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { CardType } from '../../model/card.model';
import { ListItemComponent } from '../list-item/list-item.component';
import { CardHeaderDirective } from '../card-header/card-header.directive';

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

  readonly add = output<void>();
  readonly delete = output<number>();

  CardType = CardType;

  @ContentChild(CardHeaderDirective)
  header?: CardHeaderDirective;

  @ViewChild("addButton")
  addButton!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    const e = this.addButton!.nativeElement;
    e.classList.add('flash');
    setTimeout(() => e.classList.remove('flash'), 600);
  }
}
