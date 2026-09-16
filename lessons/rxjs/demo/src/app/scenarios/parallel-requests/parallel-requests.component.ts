import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, mergeMap, forkJoin } from 'rxjs';

import { EventLogService } from '../../core/event-log.service';
import { ItemPayload, TRANSPORT } from '../../core/transport';
import { SplitViewComponent } from '../../shared/split-view/split-view.component';
import { ScenarioMeta } from '../scenario.model';

export const PARALLEL_REQUESTS_META: ScenarioMeta = {
  id: 'parallel-requests',
  name: 'Параллельные запросы',
  slides: [
    { page: 38, title: 'mergeMap — выполнять параллельно' },
    { page: 46, title: 'forkJoin()' },
    { page: 63, title: 'Паттерн: загрузка нескольких источников' },
  ],
  operators: ['mergeMap', 'forkJoin'],
  summary:
    'Загрузить N ресурсов параллельно. mergeMap — поток по мере готовности, forkJoin — дождаться всех.',
};

const IDS = [1, 2, 3, 4] as const;

const IMPERATIVE_CODE = `// Promise.all: каждый Observable вручную оборачиваем
// в Promise. Ошибка любого — падает всё.
run(): void {
  const promises = IDS.map(
    (id) =>
      new Promise<ItemPayload>((resolve, reject) => {
        this.transport.getItem(id).subscribe({
          next: resolve,
          error: reject,
        });
      }),
  );

  Promise.all(promises)
    .then((items) => this.items.set(items))
    .catch((err) => this.error.set(err.message));
}

// Проблемы: нет «по мере готовности» — только «все сразу»,
// обёртка Observable → Promise — ручная.`;

const REACTIVE_CODE = `// forkJoin — дождаться всех и получить массив.
forkJoin(IDS.map((id) => this.transport.getItem(id)))
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe((items) => this.items.set(items));

// mergeMap — результаты по мере готовности,
// без ожидания остальных.
from(IDS)
  .pipe(
    mergeMap((id) => this.transport.getItem(id)),
    takeUntilDestroyed(this.destroyRef),
  )
  .subscribe((item) => this.items.update((list) => [...list, item]));`;

interface AssetView {
  readonly id: number;
  readonly name: string;
  readonly tag: string;
  readonly price: number;
  readonly delta: number;
  readonly emoji: string;
}

const ASSETS = [
  { emoji: '🪙', name: 'BTC' },
  { emoji: '💎', name: 'ETH' },
  { emoji: '📈', name: 'S&P 500' },
  { emoji: '🥇', name: 'GOLD' },
] as const;

function toAsset(item: ItemPayload): AssetView {
  const meta = ASSETS[(item.id - 1) % ASSETS.length]!;
  return {
    id: item.id,
    name: meta.name,
    tag: item.tag,
    price: 1000 + ((item.id * 7919) % 90000),
    delta: ((item.id * 37) % 21) - 10,
    emoji: meta.emoji,
  };
}

/**
 * Демо: торговый дашборд — 4 актива грузятся параллельно.
 * Императивный путь — Promise.all (все или ничего).
 * Реактивный — forkJoin («все сразу») и mergeMap («по мере готовности»).
 */
@Component({
  selector: 'app-parallel-requests',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SplitViewComponent],
  template: `
    <app-split-view
      imperativeTitle="Императивно (Promise.all)"
      reactiveTitle="Реактивно (forkJoin + mergeMap)"
      [imperativeCode]="imperativeCode"
      [reactiveCode]="reactiveCode"
    >
      <div slot="imperative" class="widget">
        <button type="button" class="load-btn" (click)="impRun()">
          Обновить котировки
        </button>
        <div class="asset-grid">
          @for (i of [1, 2, 3, 4]; track i) {
            @if (impReady() >= i) {
              @let a = impAssets()[i - 1];
              @if (a; as asset) {
                <div class="asset-card">
                  <span class="asset-card__emoji">{{ asset.emoji }}</span>
                  <div class="asset-card__body">
                    <strong>{{ asset.name }}</strong>
                    <span class="asset-card__price">{{ asset.price }} ₽</span>
                    <span
                      class="asset-card__delta"
                      [class.asset-card__delta--down]="asset.delta < 0"
                    >
                      {{ asset.delta >= 0 ? '▲' : '▼' }} {{ asset.delta }}%
                    </span>
                  </div>
                </div>
              }
            } @else {
              <div class="asset-card">
                <span class="asset-card__emoji skeleton"></span>
                <div class="asset-card__body">
                  <div class="skeleton asset-card__line"></div>
                  <div class="skeleton asset-card__line asset-card__line--short"></div>
                </div>
              </div>
            }
          }
        </div>
      </div>
      <div slot="reactive" class="widget">
        <div class="load-btn-row">
          <button type="button" class="load-btn" (click)="reaFork()">
            forkJoin — все сразу
          </button>
          <button type="button" class="load-btn" (click)="reaMerge()">
            mergeMap — по мере готовности
          </button>
        </div>
        <div class="asset-grid">
          @for (i of [1, 2, 3, 4]; track i) {
            @if (reaReady() >= i) {
              @let a = reaAssets()[i - 1];
              @if (a; as asset) {
                <div class="asset-card">
                  <span class="asset-card__emoji">{{ asset.emoji }}</span>
                  <div class="asset-card__body">
                    <strong>{{ asset.name }}</strong>
                    <span class="asset-card__price">{{ asset.price }} ₽</span>
                    <span
                      class="asset-card__delta"
                      [class.asset-card__delta--down]="asset.delta < 0"
                    >
                      {{ asset.delta >= 0 ? '▲' : '▼' }} {{ asset.delta }}%
                    </span>
                  </div>
                </div>
              }
            } @else {
              <div class="asset-card">
                <span class="asset-card__emoji skeleton"></span>
                <div class="asset-card__body">
                  <div class="skeleton asset-card__line"></div>
                  <div class="skeleton asset-card__line asset-card__line--short"></div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </app-split-view>
  `,
  styles: [
    `
      .load-btn-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .load-btn {
        background: var(--color-teal);
        border-color: var(--color-teal);
        color: #f7f6f2;
        font-weight: 600;
      }
      .asset-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .asset-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 14px;
      }
      .asset-card__emoji {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-bg-elev-2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }
      .asset-card__body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .asset-card__body strong {
        font-size: 14px;
      }
      .asset-card__price {
        font-size: 16px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .asset-card__delta {
        font-size: 12.5px;
        color: var(--color-green-light);
        font-variant-numeric: tabular-nums;
      }
      .asset-card__delta--down {
        color: #d4707f;
      }
      .asset-card__line {
        height: 13px;
        width: 80px;
      }
      .asset-card__line--short {
        width: 56px;
      }
    `,
  ],
})
export class ParallelRequestsComponent {
  protected readonly imperativeCode = IMPERATIVE_CODE;
  protected readonly reactiveCode = REACTIVE_CODE;

  private readonly transport = inject(TRANSPORT);
  private readonly log = inject(EventLogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly impAssets = signal<ReadonlyArray<AssetView>>([]);
  protected readonly impReady = signal(0);
  protected readonly reaAssets = signal<ReadonlyArray<AssetView>>([]);
  protected readonly reaReady = signal(0);

  protected readonly toAsset = toAsset;

  /**
   * Императивно: Promise.all — оборачиваем каждый Observable в Promise через
   * «firstValueFrom-эквивалент». Здесь показан явный «промис-стиль».
   */
  protected impRun(): void {
    this.impAssets.set([]);
    this.impReady.set(0);
    this.log.push('imperative', 'event', 'Promise.all start');
    const promises = IDS.map((id) => {
      return new Promise<ItemPayload>((resolve, reject) => {
        this.transport.getItem(id, { delayMs: 100 + id * 200 }).subscribe({
          next: (item) => {
            this.impAssets.update((list) => [...list, toAsset(item)]);
            this.impReady.update((n) => n + 1);
            this.log.push('imperative', 'next', `#${item.id} ready`);
            resolve(item);
          },
          error: (err: Error) => {
            this.log.push('imperative', 'error', err.message);
            reject(err);
          },
        });
      });
    });
    Promise.all(promises)
      .then(() => this.log.push('imperative', 'success', 'Promise.all resolved'))
      .catch((err) => this.log.push('imperative', 'error', err.message));
  }

  protected reaFork(): void {
    this.reaAssets.set([]);
    this.reaReady.set(0);
    this.log.push('reactive', 'event', 'forkJoin start');
    forkJoin(IDS.map((id) => this.transport.getItem(id, { delayMs: 100 + id * 200 })))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.reaAssets.set(items.map(toAsset));
        this.reaReady.set(items.length);
        this.log.push('reactive', 'success', `forkJoin: ${items.length} items`);
      });
  }

  protected reaMerge(): void {
    this.reaAssets.set([]);
    this.reaReady.set(0);
    this.log.push('reactive', 'event', 'mergeMap start');
    from(IDS)
      .pipe(
        mergeMap((id) => this.transport.getItem(id, { delayMs: 100 + id * 200 })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((item) => {
        this.reaAssets.update((list) => [...list, toAsset(item)]);
        this.reaReady.update((n) => n + 1);
        this.log.push('reactive', 'next', `#${item.id} ready`);
      });
  }
}
