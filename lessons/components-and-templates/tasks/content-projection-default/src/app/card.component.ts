import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div class="flex items-start justify-between gap-2">
      <ng-content select="[card-title]" />
      <div class="flex gap-1">
        <button type="button" title="Закрепить" (click)="togglePin()">
          📌
        </button>
        <button type="button" title="Закрыть" (click)="closed.emit()">Х</button>
      </div>
    </div>
    <ng-content select="[card-message]" />
    @if (!message()) {
      <div>Default message</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
    tabindex: '0',
    '[class.pinned]': 'pinned()',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  private readonly eventLog = inject(EventLogService);
  readonly closed = output<void>();
  protected readonly message = contentChild<ElementRef>('cardMessage');
  protected readonly pinned = signal(false);

  ngOnInit(): void {
    this.eventLog.log('Card created');
  }

  ngOnDestroy(): void {
    this.eventLog.log('Card destroyed');
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  protected togglePin(): void {
    this.pinned.update((pinned) => !pinned);
  }
}
