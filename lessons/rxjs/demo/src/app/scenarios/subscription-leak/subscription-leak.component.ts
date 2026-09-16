import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Subscription, interval, map } from 'rxjs';

import { EventLogService } from '../../core/event-log.service';
import { SplitViewComponent } from '../../shared/split-view/split-view.component';
import { ScenarioMeta } from '../scenario.model';

export const SUBSCRIPTION_LEAK_META: ScenarioMeta = {
  id: 'subscription-leak',
  name: 'Утечка подписок',
  slides: [
    { page: 13, title: 'Subscription — это ресурс' },
    { page: 57, title: 'takeUntilDestroyed и injection context' },
    { page: 67, title: 'Паттерн: предотвращение утечек' },
  ],
  operators: ['takeUntilDestroyed', 'AsyncPipe'],
  summary:
    'Создайте и уничтожьте виджет: зомби-подписка продолжит тикать после destroy, takeUntilDestroyed — нет.',
};

const IMPERATIVE_CODE = `// Ручная подписка: нужно сохранить Subscription
// и не забыть отписаться в ngOnDestroy.
private sub?: Subscription;

ngOnInit(): void {
  this.sub = interval(500).subscribe((n) => {
    this.ticks.set(n);
  });
}

// Если забыть unsubscribe — interval продолжит тикать
// даже после уничтожения компонента: утечка памяти
// и призрачные обновления состояния.`;

const REACTIVE_CODE = `// takeUntilDestroyed: отписка гарантирована
// самим жизненным циклом компонента.
constructor() {
  interval(500)
    .pipe(takeUntilDestroyed())
    .subscribe((n) => this.ticks.set(n));
}

// Или AsyncPipe в шаблоне — подписка управляется view:
// {{ ticks$ | async }}`;

const TRACKS = [
  { title: 'Marble Symphony', artist: 'The Observables', emoji: '🎵' },
  { title: 'Hot & Cold Observable', artist: 'Multicast', emoji: '🎶' },
  { title: 'Backpressure Blues', artist: 'Buffer Count', emoji: '🎼' },
] as const;

/**
 * Интерактивное демо утечки как музыкальный плеер: «Создать плеер» монтирует
 * виджет с играющим треком (прогресс-бар тикает), «Удалить» — снимает с DOM.
 * В императивном плеере подписка на interval намеренно не отписывается —
 * после удаления прогресс продолжает идти (зомби-плеер). Реактивный
 * останавливается ровно в момент destroy.
 */
@Component({
  selector: 'app-subscription-leak',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SplitViewComponent],
  template: `
    <app-split-view
      imperativeTitle="Императивно (sub без отписки)"
      reactiveTitle="Реактивно (takeUntilDestroyed)"
      [imperativeCode]="imperativeCode"
      [reactiveCode]="reactiveCode"
    >
      <div slot="imperative" class="widget">
        @if (!impAlive()) {
          <button type="button" class="player-btn" (click)="impCreate()">
            ▶ Открыть плеер
          </button>
        }
        @if (impAlive(); as alive) {
          <div class="player">
            <div class="player__top">
              <span class="player__cover">{{ track.emoji }}</span>
              <div class="player__meta">
                <strong>{{ track.title }}</strong>
                <span>{{ track.artist }}</span>
              </div>
              <button
                type="button"
                class="player__close"
                aria-label="Закрыть плеер"
                (click)="impDestroy()"
              >
                ✕
              </button>
            </div>
            <div class="player__progress">
              <div
                class="player__progress-fill"
                [style.width.%]="(impTicks() % 20) * 5"
              ></div>
            </div>
            <div class="player__time">
              <span>{{ impTicks() % 20 }} сек</span>
              <span>♪ играет</span>
            </div>
          </div>
        } @else {
          <div class="zombie-card">
            <span class="zombie-card__icon">🧟</span>
            <div>
              <strong>Плеер закрыт, но музыка играет</strong>
              <p>
                Зомби-тиков: <em class="zombie-card__count">{{ impZombieTicks() }}</em>
              </p>
              <small>Подписка не отписана — interval продолжает работать в памяти.</small>
            </div>
          </div>
        }
      </div>
      <div slot="reactive" class="widget">
        @if (!reaAlive()) {
          <button type="button" class="player-btn" (click)="reaCreate()">
            ▶ Открыть плеер
          </button>
        }
        @if (reaAlive(); as alive) {
          <div class="player">
            <div class="player__top">
              <span class="player__cover">{{ track.emoji }}</span>
              <div class="player__meta">
                <strong>{{ track.title }}</strong>
                <span>{{ track.artist }}</span>
              </div>
              <button
                type="button"
                class="player__close"
                aria-label="Закрыть плеер"
                (click)="reaDestroy()"
              >
                ✕
              </button>
            </div>
            <div class="player__progress">
              <div
                class="player__progress-fill"
                [style.width.%]="(reaTicks() % 20) * 5"
              ></div>
            </div>
            <div class="player__time">
              <span>{{ reaTicks() % 20 }} сек</span>
              <span>♪ играет</span>
            </div>
          </div>
        } @else {
          <div class="clean-card">
            <span class="clean-card__icon">✅</span>
            <div>
              <strong>Плеер закрыт, музыка остановлена</strong>
              <p>Зомби-тиков: <em class="clean-card__count">0</em></p>
              <small>takeUntilDestroyed отписался автоматически при destroy.</small>
            </div>
          </div>
        }
      </div>
    </app-split-view>
  `,
  styles: [
    `
      .player-btn {
        background: var(--color-teal);
        border-color: var(--color-teal);
        color: #f7f6f2;
        font-weight: 600;
        align-self: flex-start;
      }
      .player {
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 16px;
      }
      .player__top {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .player__cover {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-sm);
        background: var(--color-bg-elev-2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        flex-shrink: 0;
      }
      .player__meta {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;

        strong {
          font-size: 15px;
        }
        span {
          color: var(--color-text-dim);
          font-size: 12.5px;
        }
      }
      .player__close {
        background: transparent;
        border: none;
        color: var(--color-text-dim);
        font-size: 16px;
        padding: 4px 8px;
        cursor: pointer;

        &:hover {
          color: var(--color-text);
        }
      }
      .player__progress {
        height: 6px;
        border-radius: 999px;
        background: var(--color-bg-elev-2);
        overflow: hidden;
      }
      .player__progress-fill {
        height: 100%;
        border-radius: 999px;
        background: var(--color-teal-light);
        transition: width 0.4s linear;
      }
      .player__time {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--color-text-dim);
        font-variant-numeric: tabular-nums;
      }
      .zombie-card,
      .clean-card {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        border-radius: var(--radius-md);
        padding: 14px 16px;
      }
      .zombie-card {
        background: rgba(161, 53, 68, 0.12);
        border: 1px dashed var(--color-red);
      }
      .clean-card {
        background: rgba(67, 122, 34, 0.12);
        border: 1px dashed var(--color-green);
      }
      .zombie-card__icon,
      .clean-card__icon {
        font-size: 24px;
      }
      .zombie-card strong,
      .clean-card strong {
        font-size: 14.5px;
      }
      .zombie-card p,
      .clean-card p {
        margin: 4px 0;
        font-size: 13.5px;
      }
      .zombie-card__count {
        color: #d4707f;
        font-style: normal;
        font-weight: 700;
        font-size: 18px;
      }
      .clean-card__count {
        color: var(--color-green-light);
        font-style: normal;
        font-weight: 700;
        font-size: 18px;
      }
      .zombie-card small,
      .clean-card small {
        color: var(--color-text-dim);
        font-size: 12.5px;
      }
    `,
  ],
})
export class SubscriptionLeakComponent implements OnDestroy {
  protected readonly imperativeCode = IMPERATIVE_CODE;
  protected readonly reactiveCode = REACTIVE_CODE;

  protected readonly track = TRACKS[0]!;

  private readonly log = inject(EventLogService);

  protected readonly impAlive = signal(false);
  protected readonly reaAlive = signal(false);
  protected readonly impTicks = signal(0);
  protected readonly impZombieTicks = signal(0);
  protected readonly reaTicks = signal(0);

  // Зомби-подписка: живёт в родителе, но «принадлежит» уничтоженному виджету.
  private impZombieSub: Subscription | null = null;
  private reaSub: Subscription | null = null;

  protected impCreate(): void {
    this.impZombieSub?.unsubscribe();
    this.impTicks.set(0);
    this.impZombieTicks.set(0);
    this.impAlive.set(true);
    this.log.push('imperative', 'event', 'плеер открыт, interval(500) запущен');

    // Намеренно НЕ сохраняем для отписки при destroy — это и есть утечка.
    this.impZombieSub = interval(500)
      .pipe(map((n) => `imp tick #${n}`))
      .subscribe(() => {
        this.impTicks.update((n) => n + 1);
        if (!this.impAlive()) {
          this.impZombieTicks.update((n) => n + 1);
          this.log.push(
            'imperative',
            'error',
            `зомби-тик #${this.impZombieTicks()} — плеер уже закрыт`,
          );
        }
      });
  }

  protected impDestroy(): void {
    this.impAlive.set(false);
    this.log.push('imperative', 'event', 'плеер закрыт (unsubscribe забыт!)');
    // this.impZombieSub?.unsubscribe() — НАРОЧНО не вызываем.
  }

  protected reaCreate(): void {
    this.reaSub?.unsubscribe();
    this.reaTicks.set(0);
    this.reaAlive.set(true);
    this.log.push('reactive', 'event', 'плеер открыт, interval(500) запущен');

    this.reaSub = interval(500)
      .pipe(map((n) => `rea tick #${n}`))
      .subscribe(() => this.reaTicks.update((n) => n + 1));
  }

  protected reaDestroy(): void {
    this.reaAlive.set(false);
    // Эквивалент takeUntilDestroyed: отписка в момент уничтожения.
    this.reaSub?.unsubscribe();
    this.reaSub = null;
    this.log.push('reactive', 'success', 'плеер закрыт, подписка очищена');
  }

  ngOnDestroy(): void {
    this.impZombieSub?.unsubscribe();
    this.reaSub?.unsubscribe();
  }
}