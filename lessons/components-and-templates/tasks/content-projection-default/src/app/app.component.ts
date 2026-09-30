import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
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
    <form
      class="flex items-end gap-2"
      (submit)="onSubmit($event, titleInput)">
      <label class="flex flex-1 flex-col gap-1">
        Наименование новой карточки
        <input
          #titleInput
          name="title"
          placeholder="Наименование"
          autocomplete="off"
          class="rounded-sm border border-gray-300 p-1" />
      </label>

      <button
        type="submit"
        class="rounded-sm border border-gray-300 px-3 py-1 hover:bg-gray-100">
        Добавить
      </button>
    </form>

    <div class="flex flex-wrap gap-3">
      @for (card of cards(); track card.id) {
        <app-card (closed)="removeCard(card.id)">
          <h3 card-title class="m-0 text-base font-semibold">
            {{ card.title }}
          </h3>

          @if (card.message) {
            <span card-message>{{ card.message }}</span>
          }
        </app-card>
      } @empty {
        <p class="m-0 text-sm text-gray-500">Карточек пока нет</p>
      }
    </div>

    <section class="mt-2 border-t border-gray-300 pt-2">
      <h3 class="m-0 font-semibold">Event log</h3>
      <ul class="text-sm text-gray-600">
        @for (entry of eventLog.entries(); track $index) {
          <li>{{ entry }}</li>
        } @empty {
          <li class="text-gray-400">Событий пока нет</li>
        }
      </ul>
    </section>
  `,
  host: {
    class: 'block p-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly eventLog = inject(EventLogService);

  protected readonly cards = signal<CardData[]>([
    { id: 1, title: 'Titre 1', message: 'Message1' },
    { id: 2, title: 'Titre 2' },
  ]);

  protected onSubmit(event: Event, titleInput: HTMLInputElement): void {
    event.preventDefault();
    this.addCard(titleInput.value);
    titleInput.value = '';
  }

  protected addCard(title: string): void {
    if (!title.trim()) {
      return;
    }

    this.cards.update((cards) => [
      ...cards,
      { id: nextCardId++, title: title.trim() },
    ]);
  }

  protected removeCard(id: number): void {
    this.cards.update((cards) => cards.filter((card) => card.id !== id));
  }
}
