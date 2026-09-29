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
    <ng-content select="[card-title]"></ng-content>
    @if (message()) {
      <ng-content select="[card-message]"></ng-content>
    } @else {
      <div>Default message</div>
    }
    <button
      type="button"
      class="border border-grey rounded-sm px-2 py-1"
      (click)="onClose()"
    > ✕ Закрыть </button>

    <button
      type="button"
      class="border border-grey rounded-sm px-2 py-1"
      (click)="togglePin()"
    > 📌 Закрепить </button>
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

  protected readonly message =
    contentChild<ElementRef>("message");
  protected readonly pinned = signal(false)

  readonly closed = output<void>();

  ngOnInit() : void {
    this.eventLog.log("Card created")
  }

  ngOnDestroy() : void {
    this.eventLog.log("Card destroyed")
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  onClose() : void {
    this.closed.emit();
  }
  togglePin() : void {
    this.pinned.set(!this.pinned());
  }
}
