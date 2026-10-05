import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  input,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { CardType } from '../../model/card.model';
import { ListItemComponent } from '../list-item/list-item.component';
import { ListItem } from '../../model/list-item';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [ListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements AfterViewInit, OnDestroy {
  public readonly addNew = output<void>();
  public readonly delete = output<number>();

  @ViewChild('addButton')
  addButton!: ElementRef<HTMLButtonElement>;

  @ContentChild('header')
  header?: ElementRef<HTMLElement>;

  get hasHeader(): boolean {
    return !!this.header;
  }

  readonly list = input<ListItem[] | null>(null);
  readonly type = input.required<CardType>();

  private flashTimer?: ReturnType<typeof setTimeout>;

  addNewItem() {
    this.addNew.emit();
  }

  deleteItem(id: number) {
    this.delete.emit(id);
  }

  ngAfterViewInit() : void {
    this.addButton.nativeElement.classList.add('flash');
    this.flashTimer = setTimeout(() => {
      this.addButton.nativeElement.classList.remove('flash');
    }, 600);
  }

  ngOnDestroy() : void {
    clearTimeout(this.flashTimer)
  }
}
