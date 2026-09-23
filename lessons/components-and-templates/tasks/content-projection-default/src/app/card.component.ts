import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <ng-content select="[card-title]"></ng-content>
    <ng-content select="[card-message]"><div>Default message</div></ng-content>
    <button (click)="closed.emit()">Закрыть</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  readonly closed = output<void>();

  readonly logService = inject(EventLogService);

  ngOnInit(): void {
    this.logService.log('Card created');
  }

  ngOnDestroy(): void {
    this.logService.log('Card destroyed');
  }
}
