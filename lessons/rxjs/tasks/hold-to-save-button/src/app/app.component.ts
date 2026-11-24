import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HoldableDirective } from './holdable.directive';

@Component({
  imports: [HoldableDirective, DecimalPipe],
  selector: 'app-root',
  template: `
    <main class="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section
        class="flex w-full max-w-md flex-col gap-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <header class="flex flex-col gap-y-2">
          <div class="flex items-center justify-between">
            <span
              class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              Задача 4 · Hold-to-Action
            </span>
            <span
              class="text-xs font-semibold text-slate-500"
              data-testid="saved-counter">
              Выполнено: {{ savedCount() }}
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900">
            Подтверждение критического действия
          </h1>
          <p class="text-sm text-slate-600">
            Нажмите и удерживайте кнопку в течение
            <strong>{{ holdDuration }} мс</strong>. Если отпустить кнопку или
            увести курсор раньше времени — прогресс сбросится в <code>0%</code>.
          </p>
        </header>

        <div class="flex flex-col items-center gap-y-4">
          <button
            appHoldable
            [holdTime]="holdDuration"
            (holdProgress)="onProgress($event)"
            (holdTimeEnd)="onSend()"
            class="w-full select-none rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm transition-colors ease-in-out hover:bg-indigo-700 active:bg-indigo-800">
            Hold me ({{ holdDuration }} ms)
          </button>

          <div class="w-full">
            <div class="mb-1 flex justify-between text-xs font-medium text-slate-500">
              <span>Прогресс удержания</span>
              <span data-testid="progress-label">{{ progress() | number: '1.0-0' }}%</span>
            </div>
            <progress [value]="progress()" [max]="100"></progress>
          </div>
        </div>

        <footer
          class="rounded-xl border px-4 py-3 text-sm"
          [class.border-emerald-200]="savedCount() > 0"
          [class.bg-emerald-50]="savedCount() > 0"
          [class.text-emerald-800]="savedCount() > 0"
          [class.border-slate-200]="savedCount() === 0"
          [class.bg-slate-50]="savedCount() === 0"
          [class.text-slate-600]="savedCount() === 0">
          @if (savedCount() > 0) {
            <strong>Save it!</strong> Действие успешно подтверждено (всего:
            {{ savedCount() }}).
          } @else {
            Статус: ожидание полного удержания кнопки...
          }
        </footer>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly holdDuration = 2000;
  readonly progress = signal(0);
  readonly savedCount = signal(0);

  onProgress(value: number) {
    this.progress.set(value);
  }

  onSend() {
    console.log('Save it!');
    this.savedCount.update((count) => count + 1);
  }
}
