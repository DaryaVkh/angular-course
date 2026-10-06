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
    <ng-content select="[card-title]" />
    <ng-content select="[card-message]">
      <div>Default message</div>
    </ng-content>
    <button (click)="pinned.set(!pinned())">📌</button>
    <button (click)="closed.emit()">✕</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
    '[class.pinned]': 'pinned()',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  private readonly eventLog = inject(EventLogService);

  readonly closed = output<void>();

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
}
