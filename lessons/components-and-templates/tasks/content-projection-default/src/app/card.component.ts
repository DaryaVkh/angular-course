import { ChangeDetectionStrategy, Component, output, signal, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div class="flex justify-between items-start mb-2">
      <ng-content select="[title]"></ng-content>
      
      <div class="flex gap-2">
        <button 
          class="leading-none hover:scale-110 transition"
          (click)="togglePinned()"
          [title]="pinned() ? 'Открепить' : 'Закрепить'"
        >
          📌
        </button>
        
        <button 
          class="text-red-500 hover:text-red-700 font-bold text-2xl leading-none" 
          (click)="closed.emit()"
          aria-label="Закрыть карточку"
        >
          &times;
        </button>
      </div>
    </div>

    <ng-content select="[message]">
      <div class="text-gray-500 text-sm">Default message</div>
    </ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px] cursor-pointer',
    '[class.pinned]': 'pinned()',
    '[class.hovered]': 'isHovered()',
    '[class.focused]': 'focused()',
    tabindex: '0',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  private readonly eventLog = inject(EventLogService);

  readonly closed = output<void>();
  protected readonly pinned = signal<boolean>(false);
  protected readonly focused = signal<boolean>(false);
  protected readonly isHovered = signal<boolean>(false);

  ngOnInit(): void {
    this.eventLog.log('Card created');
  }
  ngOnDestroy(): void {
    this.eventLog.log('Card destroyed');
  }
  togglePinned(): void {
    this.pinned.update(value => !value);
  }
  onMouseEnter(): void {
    this.isHovered.set(true);
  }
  onMouseLeave(): void {
    this.isHovered.set(false);
  }
  onFocus(): void {
    this.focused.set(true);
  }
  onBlur(): void {
    this.focused.set(false);
  }

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.closed.emit();
  }
}
