import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  fromEvent,
  of,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EventLogService } from '../../core/event-log.service';
import { SearchResult, TRANSPORT } from '../../core/transport';
import { SplitViewComponent } from '../../shared/split-view/split-view.component';
import { ScenarioMeta } from '../scenario.model';

export const LIVE_SEARCH_META: ScenarioMeta = {
  id: 'live-search',
  name: 'Live search',
  slides: [
    { page: 32, title: 'debounceTime()' },
    { page: 31, title: 'distinctUntilChanged()' },
    { page: 37, title: 'switchMap — отменить прошлое' },
    { page: 60, title: 'Паттерн: живой поиск без лишних запросов' },
  ],
  operators: ['debounceTime', 'distinctUntilChanged', 'switchMap'],
  summary:
    'Поиск по вводу: ждём паузу, убираем дубли, отменяем устаревшие запросы.',
};

const IMPERATIVE_CODE = `// На каждый символ — новый запрос.
// Ручной счётчик seq имитирует AbortController:
// если ввод изменился — старый ответ игнорируем.
private impSeq = 0;

onInput(value: string): void {
  const mySeq = ++this.impSeq;

  this.transport.search({ term: value }).subscribe((result) => {
    if (mySeq !== this.impSeq) {
      return; // ответ устарел — отбрасываем
    }
    this.result.set(result);
  });
}

// Проблемы: запрос на каждый символ, гонка ответов,
// ручная координация «актуальности».`;

const REACTIVE_CODE = `// debounceTime — ждём паузу в вводе.
// distinctUntilChanged — не ищем то же самое дважды.
// switchMap — сам отменяет устаревший запрос.
fromEvent<InputEvent>(input, 'input')
  .pipe(
    map((e) => (e.target as HTMLInputElement).value),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => this.transport.search({ term })),
    takeUntilDestroyed(this.destroyRef),
  )
  .subscribe((result) => {
    this.result.set(result);
  });

// Никаких ручных флагов: отмена — часть оператора.`;

interface BookView {
  readonly id: number;
  readonly title: string;
  readonly tag: string;
  readonly price: number;
  readonly rating: number;
}

function toBooks(result: SearchResult): ReadonlyArray<BookView> {
  return result.items.map((it) => ({
    id: it.id,
    title: it.name,
    tag: it.tag,
    price: 290 + ((it.id * 37) % 1500),
    rating: 3.5 + ((it.id % 15) / 10),
  }));
}

/**
 * Live search как поиск в книжном маркетплейсе: ввод в строке поиска →
 * сетка карточек книг с ценой и рейтингом. Императивно — ручной seq-флаг,
 * реактивно — debounce + distinct + switchMap.
 */
@Component({
  selector: 'app-live-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SplitViewComponent],
  template: `
    <app-split-view
      imperativeTitle="Императивно (флаг + ручная отмена)"
      reactiveTitle="Реактивно (debounce + distinct + switchMap)"
      [imperativeCode]="imperativeCode"
      [reactiveCode]="reactiveCode"
    >
      <div slot="imperative" class="widget">
        <div class="shop-search">
          <span class="shop-search__icon">🔍</span>
          <input
            #imp
            type="text"
            placeholder="Поиск книг…"
            (input)="onImpInput(imp.value)"
          />
        </div>
        @if (impLoading()) {
          <div class="book-grid">
            @for (_ of [1, 2, 3]; track $index) {
              <div class="book-card">
                <div class="book-card__cover skeleton"></div>
                <div class="skeleton book-card__line"></div>
                <div class="skeleton book-card__line book-card__line--short"></div>
              </div>
            }
          </div>
        } @else if (impBooks().length > 0) {
          <div class="book-grid">
            @for (b of impBooks(); track b.id) {
              <article class="book-card">
                <div class="book-card__cover" [attr.data-tag]="b.tag">
                  {{ b.title.charAt(0) }}
                </div>
                <strong class="book-card__title">{{ b.title }}</strong>
                <span class="book-card__tag">{{ b.tag }}</span>
                <div class="book-card__meta">
                  <span class="book-card__price">{{ b.price }} ₽</span>
                  <span class="book-card__rating">★ {{ b.rating.toFixed(1) }}</span>
                </div>
              </article>
            }
          </div>
        } @else {
          <p class="widget__hint">Начните вводить название…</p>
        }
      </div>
      <div slot="reactive" class="widget">
        <div class="shop-search">
          <span class="shop-search__icon">🔍</span>
          <input #rea type="text" placeholder="Поиск книг…" />
        </div>
        @if (reaLoading()) {
          <div class="book-grid">
            @for (_ of [1, 2, 3]; track $index) {
              <div class="book-card">
                <div class="book-card__cover skeleton"></div>
                <div class="skeleton book-card__line"></div>
                <div class="skeleton book-card__line book-card__line--short"></div>
              </div>
            }
          </div>
        } @else if (reaBooks().length > 0) {
          <div class="book-grid">
            @for (b of reaBooks(); track b.id) {
              <article class="book-card">
                <div class="book-card__cover" [attr.data-tag]="b.tag">
                  {{ b.title.charAt(0) }}
                </div>
                <strong class="book-card__title">{{ b.title }}</strong>
                <span class="book-card__tag">{{ b.tag }}</span>
                <div class="book-card__meta">
                  <span class="book-card__price">{{ b.price }} ₽</span>
                  <span class="book-card__rating">★ {{ b.rating.toFixed(1) }}</span>
                </div>
              </article>
            }
          </div>
        } @else {
          <p class="widget__hint">Начните вводить название…</p>
        }
      </div>
    </app-split-view>
  `,
  styles: [
    `
      .shop-search {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 999px;
        padding: 10px 16px;
      }
      .shop-search__icon {
        font-size: 15px;
        opacity: 0.7;
      }
      .shop-search input {
        border: none;
        background: transparent;
        padding: 0;
        flex: 1;
      }
      .book-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .book-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 12px;
      }
      .book-card__cover {
        aspect-ratio: 3 / 4;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        font-weight: 700;
        color: rgba(247, 246, 242, 0.85);
        background: var(--color-teal);

        &[data-tag='hot'] {
          background: var(--color-red);
        }
        &[data-tag='new'] {
          background: var(--color-blue);
        }
        &[data-tag='sale'] {
          background: var(--color-orange);
        }
        &[data-tag='limited'] {
          background: var(--color-green);
        }
      }
      .book-card__title {
        font-size: 13.5px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .book-card__tag {
        font-size: 11px;
        color: var(--color-text-dim);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .book-card__meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-top: auto;
      }
      .book-card__price {
        font-weight: 700;
        font-size: 14.5px;
      }
      .book-card__rating {
        color: #f0a04e;
        font-size: 12.5px;
      }
      .book-card__line {
        height: 12px;
        width: 100%;
      }
      .book-card__line--short {
        width: 60%;
      }
    `,
  ],
})
export class LiveSearchComponent implements AfterViewInit {
  protected readonly imperativeCode = IMPERATIVE_CODE;
  protected readonly reactiveCode = REACTIVE_CODE;

  private readonly transport = inject(TRANSPORT);
  private readonly log = inject(EventLogService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('imp', { static: true }) private impRef!: ElementRef<HTMLInputElement>;
  @ViewChild('rea', { static: true }) private reaRef!: ElementRef<HTMLInputElement>;

  protected readonly impBooks = signal<ReadonlyArray<BookView>>([]);
  protected readonly reaBooks = signal<ReadonlyArray<BookView>>([]);
  protected readonly impLoading = signal(false);
  protected readonly reaLoading = signal(false);

  // Императивный «seq» — имитация AbortController: помнит, какой запрос актуален.
  private impSeq = 0;

  ngAfterViewInit(): void {
    // ============ REACTIVE ============
    fromEvent<InputEvent>(this.reaRef.nativeElement, 'input')
      .pipe(
        map((event) => (event.target as HTMLInputElement).value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.log.push('reactive', 'event', `valueChanges "${term}"`);
          this.reaLoading.set(true);
          return this.transport.search({ term }, { failRate: 0.3 }).pipe(
            finalize(() => this.log.push('reactive', 'info', `inner teardown "${term}"`)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.log.push('reactive', 'next', `${result.term}: ${result.items.length} items`);
          this.reaBooks.set(toBooks(result));
          this.reaLoading.set(false);
        },
        error: (err: Error) => {
          this.log.push('reactive', 'error', err.message);
          this.reaBooks.set([]);
          this.reaLoading.set(false);
        },
      });
  }

  /**
   * Императивный обработчик: руками запускаем запрос и помним его seq.
   * Если ввод успел измениться — старый ответ просто игнорируем.
   */
  protected onImpInput(value: string): void {
    const mySeq = ++this.impSeq;
    this.log.push('imperative', 'event', `input "${value}" (#${mySeq})`);
    this.impLoading.set(true);

    this.transport
      .search({ term: value }, { failRate: 0.3 })
      .pipe(
        catchError((err: Error) => {
          if (mySeq === this.impSeq) {
            this.log.push('imperative', 'error', err.message);
            this.impBooks.set([]);
            this.impLoading.set(false);
          } else {
            this.log.push('imperative', 'cancelled', `ошибка устаревшего #${mySeq}`);
          }
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (mySeq !== this.impSeq) {
          this.log.push('imperative', 'cancelled', `ответ #${mySeq} устарел`);
          return;
        }
        this.impLoading.set(false);
        if (result) {
          this.log.push('imperative', 'next', `${result.term}: ${result.items.length} items`);
          this.impBooks.set(toBooks(result));
        }
      });
  }
}