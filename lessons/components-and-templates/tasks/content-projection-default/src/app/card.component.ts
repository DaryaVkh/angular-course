import {
  ChangeDetectionStrategy,
  Component,
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
    <div class="mb-2 flex items-start justify-between">
      <div class="font-semibold">
        <ng-content select="[card-title]"></ng-content>
      </div>
      <div class="flex gap-2">
        <button
          (click)="pinned.set(!pinned())"
          class="rounded px-1 hover:bg-gray-100"
          title="Pin">
          📌
        </button>
        <button
          (click)="closed.emit()"
          class="px-1 text-gray-500 hover:text-red-500"
          title="Close">
          ✕
        </button>
      </div>
    </div>
    <div class="text-sm">
      <ng-content select="[card-message]"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
    '[class.pinned]': 'pinned()',
    tabindex: '0',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  readonly closed = output<void>();
  readonly pinned = signal(false);
  private readonly eventLog = inject(EventLogService);

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
}
