import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, finalize, switchMap } from 'rxjs';

import { EventLogService } from '../../core/event-log.service';
import { ItemPayload, TRANSPORT } from '../../core/transport';
import { SplitViewComponent } from '../../shared/split-view/split-view.component';
import { ScenarioMeta } from '../scenario.model';

export const FAST_NAVIGATION_META: ScenarioMeta = {
  id: 'fast-navigation',
  name: 'Быстрая навигация',
  slides: [
    { page: 37, title: 'switchMap — отменить прошлое' },
    { page: 53, title: 'Router params → актуальные данные' },
    { page: 61, title: 'Паттерн: отмена устаревшего HTTP-запроса' },
  ],
  operators: ['switchMap'],
  summary:
    'Переключение между «страницами» — старый запрос должен отмениться, чтобы UI не показывал чужие данные.',
};

const IDS = [1, 2, 3, 4, 5, 6] as const;

const IMPERATIVE_CODE = `// Ручной счётчик seq: помним, какая навигация последняя.
private impSeq = 0;

goTo(id: number): void {
  const mySeq = ++this.impSeq;

  this.transport.getItem(id).subscribe((item) => {
    if (mySeq !== this.impSeq) {
      return; // пользователь уже ушёл на другую «страницу»
    }
    this.item.set(item);
  });
}

// Проблемы: запрос не отменяется (грузится зря),
// актуальность отслеживаем вручную.`;

const REACTIVE_CODE = `// switchMap: новая навигация отписывает предыдущий
// внутренний Observable — старый запрос отменяется.
private readonly id$ = new Subject<number>();

constructor() {
  this.id$
    .pipe(
      switchMap((id) => this.transport.getItem(id)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((item) => this.item.set(item));
}

// Клик по кнопке просто пушит id в поток:
onGoTo(id: number): void {
  this.id$.next(id);
}`;

interface ProductView {
  readonly id: number;
  readonly name: string;
  readonly tag: string;
  readonly price: number;
  readonly emoji: string;
}

const PRODUCT_EMOJI = ['📱', '💻', '🎧', '⌚', '📷', '🎮'] as const;

function toProduct(item: ItemPayload): ProductView {
  return {
    id: item.id,
    name: item.name,
    tag: item.tag,
    price: 4990 + item.id * 1370,
    emoji: PRODUCT_EMOJI[(item.id - 1) % PRODUCT_EMOJI.length]!,
  };
}

/**
 * Демо: каталог товаров — пользователь быстро кликает по категориям,
 * карточка товара должна показывать только последний выбранный товар.
 * Императивный путь — ручной флаг, реактивный — switchMap.
 */
@Component({
  selector: 'app-fast-navigation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SplitViewComponent],
  template: `
    <app-split-view
      imperativeTitle="Императивно (флаг)"
      reactiveTitle="Реактивно (switchMap)"
      [imperativeCode]="imperativeCode"
      [reactiveCode]="reactiveCode"
    >
      <div slot="imperative" class="widget">
        <div class="catalog-nav">
          @for (id of ids; track id) {
            <button
              type="button"
              class="catalog-nav__item"
              [class.catalog-nav__item--active]="impItem()?.id === id"
              (click)="impGoTo(id)"
            >
              Товар {{ id }}
            </button>
          }
        </div>
        @if (impLoading()) {
          <div class="product-card">
            <div class="product-card__photo skeleton"></div>
            <div class="product-card__info">
              <div class="skeleton product-card__line"></div>
              <div class="skeleton product-card__line product-card__line--price"></div>
            </div>
          </div>
        } @else if (impItem(); as it) {
          @let p = toProduct(it);
          <div class="product-card">
            <div class="product-card__photo">{{ p.emoji }}</div>
            <div class="product-card__info">
              <strong>{{ p.name }}</strong>
              <span class="product-card__tag">{{ p.tag }}</span>
              <span class="product-card__price">{{ p.price }} ₽</span>
              <button type="button" class="product-card__buy">В корзину</button>
            </div>
          </div>
        } @else {
          <p class="widget__hint">Выберите товар в каталоге…</p>
        }
      </div>
      <div slot="reactive" class="widget">
        <div class="catalog-nav">
          @for (id of ids; track id) {
            <button
              type="button"
              class="catalog-nav__item"
              [class.catalog-nav__item--active]="reaItem()?.id === id"
              (click)="reaId$.next(id)"
            >
              Товар {{ id }}
            </button>
          }
        </div>
        @if (reaLoading()) {
          <div class="product-card">
            <div class="product-card__photo skeleton"></div>
            <div class="product-card__info">
              <div class="skeleton product-card__line"></div>
              <div class="skeleton product-card__line product-card__line--price"></div>
            </div>
          </div>
        } @else if (reaItem(); as it) {
          @let p = toProduct(it);
          <div class="product-card">
            <div class="product-card__photo">{{ p.emoji }}</div>
            <div class="product-card__info">
              <strong>{{ p.name }}</strong>
              <span class="product-card__tag">{{ p.tag }}</span>
              <span class="product-card__price">{{ p.price }} ₽</span>
              <button type="button" class="product-card__buy">В корзину</button>
            </div>
          </div>
        } @else {
          <p class="widget__hint">Выберите товар в каталоге…</p>
        }
      </div>
    </app-split-view>
  `,
  styles: [
    `
      .catalog-nav {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .catalog-nav__item {
        border-radius: 999px;
        font-size: 13.5px;
      }
      .catalog-nav__item--active {
        border-color: var(--color-teal-light);
        background: rgba(79, 152, 163, 0.18);
      }
      .product-card {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 16px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 16px;
        align-items: center;
      }
      .product-card__photo {
        aspect-ratio: 1;
        border-radius: var(--radius-md);
        background: var(--color-bg-elev-2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 56px;
      }
      .product-card__info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
      .product-card__info strong {
        font-size: 17px;
      }
      .product-card__tag {
        font-size: 11.5px;
        color: var(--color-text-dim);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .product-card__price {
        font-size: 21px;
        font-weight: 700;
      }
      .product-card__buy {
        background: var(--color-teal);
        border-color: var(--color-teal);
        color: #f7f6f2;
        font-weight: 600;
      }
      .product-card__line {
        height: 16px;
        width: 70%;
      }
      .product-card__line--price {
        width: 40%;
        height: 22px;
      }
    `,
  ],
})
export class FastNavigationComponent {
  protected readonly imperativeCode = IMPERATIVE_CODE;
  protected readonly reactiveCode = REACTIVE_CODE;

  private readonly transport = inject(TRANSPORT);
  private readonly log = inject(EventLogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ids = IDS;
  protected readonly impItem = signal<ItemPayload | null>(null);
  protected readonly reaItem = signal<ItemPayload | null>(null);
  protected readonly impLoading = signal(false);
  protected readonly reaLoading = signal(false);
  protected readonly reaId$ = new Subject<number>();

  protected readonly toProduct = toProduct;

  // Императивный seq.
  private impSeq = 0;

  // neverCompletes = true заставляет «висящий» запрос никогда не эмитить —
  // если бы не было отмены, UI застрял бы на первом ответе.
  constructor() {
    this.reaId$
      .pipe(
        switchMap((id) => {
          this.log.push('reactive', 'event', `navigate → ${id}`);
          this.reaLoading.set(true);
          return this.transport
            .getItem(id, { neverCompletes: true, delayMs: 1500 })
            .pipe(finalize(() => this.log.push('reactive', 'info', `inner teardown #${id}`)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((item) => {
        this.log.push('reactive', 'next', `#${item.id} ${item.name}`);
        this.reaItem.set(item);
        this.reaLoading.set(false);
      });
  }

  protected impGoTo(id: number): void {
    const mySeq = ++this.impSeq;
    this.log.push('imperative', 'event', `imp navigate → ${id} (#${mySeq})`);
    this.impLoading.set(true);

    this.transport
      .getItem(id, { neverCompletes: true, delayMs: 1500 })
      .subscribe((item) => {
        if (mySeq !== this.impSeq) {
          this.log.push('imperative', 'cancelled', `ответ #${mySeq} устарел`);
          return;
        }
        this.log.push('imperative', 'next', `#${item.id} ${item.name}`);
        this.impItem.set(item);
        this.impLoading.set(false);
      });
  }
}
