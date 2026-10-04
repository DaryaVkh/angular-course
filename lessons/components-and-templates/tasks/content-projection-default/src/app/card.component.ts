import { ChangeDetectionStrategy, Component, HostListener, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <ng-content select="[card-title]"></ng-content>
    <ng-content select="[card-message]"></ng-content>
    <ng-content></ng-content>
    <button type="button" class="button-close" (click)="closed.emit()">❌</button>
    <button type="button" class="button-pin" (click)="togglePinned()">📌</button>
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
    this.eventLog.log("Card created");
  }

  ngOnDestroy(): void {
    this.eventLog.log("Card destroyed");
  }

  togglePinned(): void {
    this.pinned.update((v) => !v);
  }

  @HostListener('keydown.escape') onEscape() { this.closed.emit() }
}
