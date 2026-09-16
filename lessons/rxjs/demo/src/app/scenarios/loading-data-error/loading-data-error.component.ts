import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  map,
  mergeMap,
  of,
  retry,
  startWith,
} from 'rxjs';

import { EventLogService } from '../../core/event-log.service';
import { ItemPayload, TRANSPORT } from '../../core/transport';
import { SplitViewComponent } from '../../shared/split-view/split-view.component';
import { ScenarioMeta } from '../scenario.model';

export const LOADING_DATA_ERROR_META: ScenarioMeta = {
  id: 'loading-data-error',
  name: 'Loading / data / error',
  slides: [
    { page: 30, title: 'startWith()' },
    { page: 64, title: 'Паттерн: обработка ошибок без поломки UI' },
    { page: 66, title: 'Паттерн: состояния loading / data / error' },
  ],
  operators: ['startWith', 'catchError', 'retry'],
  summary:
    'Состояния loading/data/error. retry + catchError не дают потоку умереть, startWith показывает loading сразу.',
};

interface ViewState {
  kind: 'loading' | 'data' | 'error';
  item?: ItemPayload;
  message?: string;
}

const IMPERATIVE_CODE = `// Три состояния — три ручных set().
load(): void {
  this.state.set({ kind: 'loading' });

  this.transport.getItem(7).subscribe({
    next: (item) => this.state.set({ kind: 'data', item }),
    error: (err) => this.state.set({ kind: 'error', message: err.message }),
  });
}

// Проблемы: состояния переключаются вручную,
// нет retry, при ошибке поток просто умирает.`;

const REACTIVE_CODE = `// Один поток ViewState: loading → data | error.
// retry — повторить запрос, catchError — не уронить поток.
private readonly click$ = new Subject<void>();

constructor() {
  this.click$
    .pipe(
      mergeMap(() =>
        this.transport.getItem(7).pipe(
          retry({ count: 2, delay: 500 }),
          catchError((err) =>
            of<ViewState>({ kind: 'error', message: err.message }),
          ),
          map((item) => ({ kind: 'data', item }) as ViewState),
          startWith<ViewState>({ kind: 'loading' }),
        ),
      ),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((state) => this.state.set(state));
}`;

interface ProfileView {
  readonly name: string;
  readonly tag: string;
  readonly followers: number;
  readonly posts: number;
}

function toProfile(item: ItemPayload): ProfileView {
  return {
    name: item.name,
    tag: '@' + item.name.toLowerCase().replace(/\s+/g, '_'),
    followers: 1200 + item.id * 357,
    posts: 42 + item.id * 13,
  };
}

/**
 * Демо: карточка профиля с состояниями loading (skeleton) / data / error.
 * Императивный путь — три состояния вручную. Реактивный — поток ViewState:
 * при каждом клике эмитим loading, дальше retry → catchError → data/error.
 */
@Component({
  selector: 'app-loading-data-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SplitViewComponent],
  template: `
    <app-split-view
      imperativeTitle="Императивно (state-машина вручную)"
      reactiveTitle="Реактивно (startWith + retry + catchError)"
      [imperativeCode]="imperativeCode"
      [reactiveCode]="reactiveCode"
    >
      <div slot="imperative" class="widget">
        <button type="button" class="load-btn" (click)="impLoad()">
          Загрузить профиль
        </button>
        @let imp = impState();
        @if (imp.kind === 'loading') {
          <div class="profile-card">
            <div class="profile-card__avatar skeleton"></div>
            <div class="profile-card__body">
              <div class="skeleton profile-card__line"></div>
              <div class="skeleton profile-card__line profile-card__line--short"></div>
              <div class="skeleton profile-card__line profile-card__line--short"></div>
            </div>
          </div>
        } @else if (imp.kind === 'data' && imp.item; as it) {
          @let p = toProfile(it);
          <div class="profile-card">
            <div class="profile-card__avatar">{{ p.name.charAt(0) }}</div>
            <div class="profile-card__body">
              <strong>{{ p.name }}</strong>
              <span class="profile-card__handle">{{ p.tag }}</span>
              <div class="profile-card__stats">
                <span><strong>{{ p.posts }}</strong> постов</span>
                <span><strong>{{ p.followers }}</strong> подписчиков</span>
              </div>
            </div>
          </div>
        } @else if (imp.kind === 'error') {
          <div class="error-card">
            <span class="error-card__icon">⚠️</span>
            <div>
              <strong>Не удалось загрузить</strong>
              <p>{{ imp.message }}</p>
            </div>
          </div>
        }
      </div>
      <div slot="reactive" class="widget">
        <button type="button" class="load-btn" (click)="reaClick$.next()">
          Загрузить профиль
        </button>
        @let rea = reaState();
        @if (rea.kind === 'loading') {
          <div class="profile-card">
            <div class="profile-card__avatar skeleton"></div>
            <div class="profile-card__body">
              <div class="skeleton profile-card__line"></div>
              <div class="skeleton profile-card__line profile-card__line--short"></div>
              <div class="skeleton profile-card__line profile-card__line--short"></div>
            </div>
          </div>
        } @else if (rea.kind === 'data' && rea.item; as it) {
          @let p = toProfile(it);
          <div class="profile-card">
            <div class="profile-card__avatar">{{ p.name.charAt(0) }}</div>
            <div class="profile-card__body">
              <strong>{{ p.name }}</strong>
              <span class="profile-card__handle">{{ p.tag }}</span>
              <div class="profile-card__stats">
                <span><strong>{{ p.posts }}</strong> постов</span>
                <span><strong>{{ p.followers }}</strong> подписчиков</span>
              </div>
            </div>
          </div>
        } @else if (rea.kind === 'error') {
          <div class="error-card">
            <span class="error-card__icon">⚠️</span>
            <div>
              <strong>Не удалось загрузить</strong>
              <p>{{ rea.message }}</p>
            </div>
          </div>
        }
      </div>
    </app-split-view>
  `,
  styles: [
    `
      .load-btn {
        background: var(--color-teal);
        border-color: var(--color-teal);
        color: #f7f6f2;
        font-weight: 600;
        align-self: flex-start;
      }
      .profile-card {
        display: flex;
        gap: 16px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 18px;
        align-items: center;
      }
      .profile-card__avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--color-teal);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .profile-card__body {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }
      .profile-card__body strong {
        font-size: 17px;
      }
      .profile-card__handle {
        color: var(--color-teal-light);
        font-size: 13px;
      }
      .profile-card__stats {
        display: flex;
        gap: 18px;
        font-size: 13px;
        color: var(--color-text-dim);

        strong {
          color: var(--color-text);
          font-size: 14.5px;
        }
      }
      .profile-card__line {
        height: 14px;
        width: 60%;
      }
      .profile-card__line--short {
        width: 35%;
      }
      .error-card {
        display: flex;
        gap: 12px;
        align-items: center;
        background: rgba(161, 53, 68, 0.12);
        border: 1px solid var(--color-red);
        border-radius: var(--radius-md);
        padding: 14px 16px;
      }
      .error-card__icon {
        font-size: 24px;
      }
      .error-card strong {
        font-size: 14.5px;
      }
      .error-card p {
        margin: 2px 0 0;
        font-size: 13px;
        color: var(--color-text-dim);
      }
    `,
  ],
})
export class LoadingDataErrorComponent {
  protected readonly imperativeCode = IMPERATIVE_CODE;
  protected readonly reactiveCode = REACTIVE_CODE;

  private readonly transport = inject(TRANSPORT);
  private readonly log = inject(EventLogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly impState = signal<ViewState>({ kind: 'loading' });
  protected readonly reaState = signal<ViewState>({ kind: 'loading' });
  protected readonly reaClick$ = new Subject<void>();

  protected readonly toProfile = toProfile;

  constructor() {
    this.reaClick$
      .pipe(
        mergeMap(() =>
          this.transport.getItem(7, { failRate: 0.7, delayMs: 300 }).pipe(
            // retry/catchError — ВНУТРИ getItem, чтобы не уронить outer stream.
            retry({ count: 2, delay: 500 }),
            catchError((err: Error) => of<ViewState>({ kind: 'error', message: err.message })),
            // data case:
            map((value) =>
              isItem(value)
                ? ({ kind: 'data', item: value } as ViewState)
                : value,
            ),
            startWith<ViewState>({ kind: 'loading' }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((state) => {
        this.reaState.set(state);
        this.log.push(
          'reactive',
          state.kind === 'error' ? 'error' : 'next',
          state.kind,
        );
      });
  }

  protected impLoad(): void {
    this.impState.set({ kind: 'loading' });
    this.log.push('imperative', 'event', 'imp load');
    this.transport
      .getItem(7, { failRate: 0.7, delayMs: 300 })
      .subscribe({
        next: (item) => {
          this.impState.set({ kind: 'data', item });
          this.log.push('imperative', 'next', item.name);
        },
        error: (err: Error) => {
          this.impState.set({ kind: 'error', message: err.message });
          this.log.push('imperative', 'error', err.message);
        },
      });
  }
}

function isItem(v: ItemPayload | ViewState): v is ItemPayload {
  return (v as ItemPayload).id !== undefined && (v as ItemPayload).name !== undefined;
}
