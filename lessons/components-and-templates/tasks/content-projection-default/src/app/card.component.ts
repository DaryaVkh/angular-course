import { ChangeDetectionStrategy, Component, output } from '@angular/core';

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
export class CardComponent {
  readonly closed = output<void>();
}
