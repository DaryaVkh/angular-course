import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div class="flex justify-between items-start mb-2">
      <ng-content select="[title]"></ng-content>
      
      <button 
        class="text-red-500 hover:text-red-700 font-bold text-xl leading-none" 
        (click)="closed.emit()"
        aria-label="Закрыть карточку"
      >
        &times;
      </button>
    </div>

    <ng-content select="[message]">
      <div class="text-gray-500 text-sm">Default message</div>
    </ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-4 border border-grey rounded-sm flex flex-col w-[200px]',
  },
})

export class CardComponent {
  readonly closed = output<void>();
}
