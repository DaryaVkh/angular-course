import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CardComponent } from './card.component';
import { EventLogService } from './event-log.service';

interface CardData {
  id: number;
  title: string;
  message?: string;
}

let nextCardId = 3;

@Component({
  imports: [CardComponent],
  selector: 'app-root',
  template: `
    <div class="flex flex-col gap-2">
      <label class="flex flex-col gap-1">
        Наименование новой карточки
        <input
          placeholder="Наименование"
          class="border border-grey rounded-sm p-1" />
      </label>
    </div>

    @for (card of cards(); track card.id) {
      <app-card [title]="card.title" [message]="card.message" />
    }

    <section class="border-t border-grey pt-2 mt-2">
      <h3 class="font-semibold">Event log</h3>
      <p class="text-sm text-gray-500">
        Сюда будут попадать записи из EventLogService — заполните их из хуков жизненного цикла
        и ngOnChanges в CardComponent.
      </p>
      <ul class="text-sm text-gray-600">
        @for (entry of eventLog.entries(); track entry) {
          <li>{{ entry }}</li>
        }
      </ul>
    </section>
  `,
  host: {
    class: 'p-4 block flex flex-col gap-1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly eventLog = inject(EventLogService);

  protected readonly cards = signal<CardData[]>([
    { id: 1, title: 'Titre 1', message: 'Message1' },
    { id: 2, title: 'Titre 2' },
  ]);

  addCard(title: string): void {
    if (!title.trim()) {
      return;
    }
    this.cards.update((cards) => [...cards, { id: nextCardId++, title }]);
  }

  removeCard(id: number): void {
    this.cards.update((cards) => cards.filter((card) => card.id !== id));
  }
}
