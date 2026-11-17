import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements AfterViewInit {
  readonly list = input<any | null>(null);
  readonly customClass = input('');
  
  readonly addItem = output<void>();
  readonly deleteItem = output<number>();
  
  @ViewChild('addButton', { static: true }) addButtonRef!: ElementRef<HTMLButtonElement>;
  @ContentChild('cardHeader') headerRef!: ElementRef<HTMLElement>;
  @ContentChild(TemplateRef) rowTpl!: TemplateRef<any>;
  
  ngAfterViewInit(): void {
    const button = this.addButtonRef.nativeElement;
    button.classList.add('flash');
    setTimeout(() => {
      button.classList.remove('flash');
    }, 600);
  }
  
  get hasHeader(): boolean {
    return !!this.headerRef;
  }
}