import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  output,
  signal,
} from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  template: `
    <div class="flex items-start justify-between gap-2">
      <ng-content select="[card-title]" />

      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          class="rounded-sm px-1 leading-none hover:bg-gray-100"
          [class.opacity-40]="!pinned()"
          [attr.aria-pressed]="pinned()"
          title="Закрепить карточку"
          (click)="togglePinned()">
          📌
        </button>

        <button
          type="button"
          class="rounded-sm px-1 leading-none hover:bg-gray-100"
          title="Закрыть карточку"
          (click)="closed.emit()">
          ✕
        </button>
      </div>
    </div>

    <p class="m-0 text-sm text-gray-600">
      <ng-content select="[card-message]">Default message</ng-content>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    class:
      'flex w-[220px] flex-col gap-2 rounded-md border border-gray-300 bg-white p-3 shadow-sm outline-none',
    '[class.pinned]': 'pinned()',
    '[class.hovered]': 'hovered()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  private readonly eventLog = inject(EventLogService);

  readonly closed = output<void>();

  protected readonly pinned = signal(false);
  protected readonly hovered = signal(false);

  ngOnInit(): void {
    this.eventLog.log('Card created');
  }

  ngOnDestroy(): void {
    this.eventLog.log('Card destroyed');
  }

  @HostListener('keydown.escape')
  protected onEscape(): void {
    this.closed.emit();
  }

  protected togglePinned(): void {
    this.pinned.update((pinned) => !pinned);
  }
}
