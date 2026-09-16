import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, exhaustMap } from 'rxjs';

import { EventLogService } from '../../core/event-log.service';
import { TRANSPORT } from '../../core/transport';
import { SplitViewComponent } from '../../shared/split-view/split-view.component';
import { ScenarioMeta } from '../scenario.model';

export const FORM_SUBMIT_META: ScenarioMeta = {
  id: 'form-submit',
  name: 'Submit формы',
  slides: [
    { page: 40, title: 'exhaustMap — игнорировать новое' },
    { page: 62, title: 'Паттерн: сохранение без повторной отправки' },
  ],
  operators: ['exhaustMap'],
  summary: 'Защита от двойного клика «Сохранить»: пока запрос идёт — игнорируем повторы.',
};

const IMPERATIVE_CODE = `// Ручной флаг busy: блокируем кнопку на время запроса.
// Не забываем сбросить его и в next, и в error!
protected busy = signal(false);

submit(): void {
  if (this.busy()) return;
  this.busy.set(true);

  this.transport.saveForm(this.form.value).subscribe({
    next: () => this.busy.set(false),
    error: () => this.busy.set(false),
  });
}

// Проблемы: состояние busy — ручное, легко забыть
// сбросить в одной из веток.`;

const REACTIVE_CODE = `// exhaustMap: пока запрос идёт, новые клики
// просто отбрасываются. Никакого флага busy.
private readonly submit$ = new Subject<void>();

constructor() {
  this.submit$
    .pipe(
      exhaustMap(() => this.transport.saveForm(this.form.value)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe();
}

// Клик — просто событие в поток:
onSubmit(): void {
  this.submit$.next();
}`;

/**
 * Демо submit как оформление заказа: корзина с товарами и итогом,
 * кнопка «Оформить заказ». Императивно — блокируем кнопку (busy),
 * реактивно — exhaustMap отбрасывает клики, пока заказ оформляется.
 */
@Component({
  selector: 'app-form-submit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SplitViewComponent],
  template: `
    <app-split-view
      imperativeTitle="Императивно (disabled кнопки)"
      reactiveTitle="Реактивно (exhaustMap)"
      [imperativeCode]="imperativeCode"
      [reactiveCode]="reactiveCode"
    >
      <div slot="imperative" class="widget">
        <div class="cart">
          <div class="cart__row">
            <span>📖 Чистый код</span>
            <span>1 890 ₽</span>
          </div>
          <div class="cart__row">
            <span>🎧 Наушники</span>
            <span>7 490 ₽</span>
          </div>
          <div class="cart__row cart__row--total">
            <span>Итого</span>
            <span>9 380 ₽</span>
          </div>
        </div>
        <button
          type="button"
          class="checkout-btn"
          [disabled]="impBusy()"
          (click)="impSubmit()"
        >
          @if (impBusy()) {
            <span class="spinner"></span> Оформляем…
          } @else {
            Оформить заказ
          }
        </button>
        <div class="stat-row">
          <div class="stat">
            <small>Кликов</small>
            <strong>{{ impCount() }}</strong>
          </div>
          <div class="stat">
            <small>Заказов</small>
            <strong>{{ impOk() }}</strong>
          </div>
        </div>
      </div>
      <div slot="reactive" class="widget">
        <div class="cart">
          <div class="cart__row">
            <span>📖 Чистый код</span>
            <span>1 890 ₽</span>
          </div>
          <div class="cart__row">
            <span>🎧 Наушники</span>
            <span>7 490 ₽</span>
          </div>
          <div class="cart__row cart__row--total">
            <span>Итого</span>
            <span>9 380 ₽</span>
          </div>
        </div>
        <button type="button" class="checkout-btn" (click)="reaClick$.next()">
          @if (reaBusy()) {
            <span class="spinner"></span> Оформляем…
          } @else {
            Оформить заказ
          }
        </button>
        <div class="stat-row">
          <div class="stat">
            <small>Кликов</small>
            <strong>{{ reaCount() }}</strong>
          </div>
          <div class="stat">
            <small>Заказов</small>
            <strong>{{ reaOk() }}</strong>
          </div>
        </div>
      </div>
    </app-split-view>
  `,
  styles: [
    `
      .cart {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 14px 16px;
      }
      .cart__row {
        display: flex;
        justify-content: space-between;
        font-size: 14.5px;
      }
      .cart__row--total {
        border-top: 1px solid var(--color-border);
        padding-top: 8px;
        margin-top: 4px;
        font-weight: 700;
        font-size: 16px;
      }
      .checkout-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--color-teal);
        border-color: var(--color-teal);
        color: #f7f6f2;
        font-weight: 600;
        font-size: 15px;
        padding: 12px 20px;
      }
    `,
  ],
})
export class FormSubmitComponent {
  protected readonly imperativeCode = IMPERATIVE_CODE;
  protected readonly reactiveCode = REACTIVE_CODE;

  private readonly transport = inject(TRANSPORT);
  private readonly log = inject(EventLogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly impBusy = signal(false);
  protected readonly impCount = signal(0);
  protected readonly impOk = signal(0);
  protected readonly reaBusy = signal(false);
  protected readonly reaCount = signal(0);
  protected readonly reaOk = signal(0);

  protected readonly reaClick$ = new Subject<void>();

  constructor() {
    this.reaClick$
      .pipe(
        exhaustMap(() => {
          this.reaCount.update((n) => n + 1);
          this.reaBusy.set(true);
          this.log.push('reactive', 'event', 'click');
          return this.transport.saveForm({ name: 'demo' }, { delayMs: 800, failRate: 0.2 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.reaOk.update((n) => n + 1);
          this.reaBusy.set(false);
          this.log.push('reactive', 'success', `saved @${res.savedAt}`);
        },
        error: (err: Error) => {
          this.reaBusy.set(false);
          this.log.push('reactive', 'error', err.message);
        },
      });
  }

  protected impSubmit(): void {
    if (this.impBusy()) return; // имитация disabled — в шаблоне кнопка и так disabled
    this.impBusy.set(true);
    this.impCount.update((n) => n + 1);
    this.log.push('imperative', 'event', 'click (busy)');

    this.transport
      .saveForm({ name: 'demo' }, { delayMs: 800, failRate: 0.2 })
      .subscribe({
        next: () => {
          this.impOk.update((n) => n + 1);
          this.impBusy.set(false);
        },
        error: (err: Error) => {
          this.impBusy.set(false);
          this.log.push('imperative', 'error', err.message);
        },
      });
  }
}
