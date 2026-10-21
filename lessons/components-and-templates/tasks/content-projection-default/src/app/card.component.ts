import {
  ChangeDetectionStrategy,
  Component, HostListener,
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
    <ng-content select="[card-title]"></ng-content>
    <ng-content select="[card-message]"><div>Default message</div></ng-content>
    <button (click)="updatePinStatus()">{{ pinned() ? '📌' : 'O' }}</button>

    <button (click)="closed.emit()">Закрыть</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.pinned]': 'pinned()',
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  readonly closed = output<void>();
  readonly pinned = signal<boolean>(false);
  readonly logService = inject(EventLogService);

  @HostListener('keydown.escape')
  onEscape() {
    this.closed.emit();
  }

  updatePinStatus(): void {
    this.pinned.update((x) => !x);
  }

  ngOnInit(): void {
    this.logService.log('Card created');
  }

  ngOnDestroy(): void {
    this.logService.log('Card destroyed');
  }
}
