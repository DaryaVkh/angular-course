import { ChangeDetectionStrategy, Component, HostListener, inject, OnDestroy, OnInit, output } from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div class="flex justify-end gap-4">
      <button type="button" (click)="onTogglePinned()">📌</button>
      <button type="button" (click)="close()">х</button>
    </div>
    <div>
      <ng-content select="[card-title]"></ng-content>
    </div>
    <div>
      <ng-content select="[card-message]"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
    '[class.pinned]': 'pinned',
    tabindex: '0',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  readonly closed = output<void>();
  private readonly eventLog = inject(EventLogService);
  protected pinned = false;

  protected close(): void {
    this.closed.emit();
  }

  ngOnInit(): void {
    this.eventLog.log('Card created');
  }

  ngOnDestroy(): void {
    this.eventLog.log('Card destroyed');
  }

  protected onTogglePinned(): void {
    this.pinned = !this.pinned;
  }

  @HostListener('keydown.escape')
  protected closeByEsc(): void {
    this.closed.emit();
  }
}
