import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, HostListener, inject, input, OnDestroy, OnInit, output, signal, TemplateRef } from '@angular/core';
import { EventLogService } from './event-log.service';

@Component({
  selector: 'app-card',
  imports: [NgTemplateOutlet],
  template: `
    <div>
      <ng-container *ngTemplateOutlet="titleTpl()"></ng-container>
    </div>
    @if (messageTpl()) {
      <div>
        <ng-container *ngTemplateOutlet="messageTpl()"></ng-container>
      </div>
    } @else {
      <div>Default message</div>
    }
    <div class="actions">
      <button class="close-button" (click)="handleClose()">×</button>
      <button (click)="pin()">📌</button>
    </div>
  `,
  styles: `
  .actions {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative p-4 border border-grey rounded-sm flex flex-col w-[200px]',
    '[class.pinned]': 'pinned()',
    tabindex: '0',
  },
})
export class CardComponent implements OnInit, OnDestroy {
  readonly eventLogSvc = inject(EventLogService);

  readonly titleTpl = contentChild.required<TemplateRef<any>>('cardTitle');
  readonly messageTpl = contentChild<TemplateRef<any>>('cardMessage');

  readonly closed = output<void>();

  readonly pinned = signal(false);

  @HostListener('keydown.escape') onEscape() {
    this.handleClose();
  }

  handleClose() {
    this.closed.emit();
  }

  pin() {
    this.pinned.update(value => !value);
  }

  ngOnInit(): void {
    this.eventLogSvc.log('Card created');
  }

  ngOnDestroy(): void {
    this.eventLogSvc.log('Card destroyed');
  }
}
