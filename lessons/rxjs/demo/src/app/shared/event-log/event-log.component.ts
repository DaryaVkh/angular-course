import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { EventLogService } from '../../core/event-log.service';
import { Lane, LogEvent, LogKind } from '../../core/log-event.model';

/**
 * Справка по нотации: что означает каждый тип «шарика» на ленте.
 * Используется и для легенды, и для детального описания по клику.
 */
const KIND_INFO: Record<LogKind, { glyph: string; title: string; description: string }> = {
  event: {
    glyph: '●',
    title: 'Событие',
    description: 'Действие пользователя или запуск операции (ввод, клик, запрос).',
  },
  next: {
    glyph: '●',
    title: 'Значение (next)',
    description: 'Поток выдал значение — данные пришли.',
  },
  success: {
    glyph: '●',
    title: 'Успех',
    description: 'Операция завершилась успешно.',
  },
  error: {
    glyph: '✕',
    title: 'Ошибка',
    description: 'Поток завершился ошибкой.',
  },
  cancelled: {
    glyph: '×',
    title: 'Отменено',
    description: 'Событие отменено или его результат устарел и был отброшен.',
  },
  info: {
    glyph: '·',
    title: 'Внутренняя отмена',
    description:
      'RxJS очистил внутреннюю подписку (teardown): устаревший запрос отменён, ресурсы освобождены.',
  },
};

const LEGEND_ORDER: ReadonlyArray<LogKind> = [
  'event',
  'next',
  'error',
  'cancelled',
  'info',
];

/**
 * Мраморная лента: события сценария как шарики на горизонтальной шкале времени.
 * Две дорожки (imperative | reactive), новые события появляются слева.
 * Клик по шарику открывает панель с детальным описанием события.
 */
@Component({
  selector: 'app-event-log',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="marbles" aria-label="Визуализация потока событий">
      <div class="marbles__legend" aria-label="Обозначения">
        @for (kind of legend; track kind) {
          <span class="marbles__legend-item" [attr.data-kind]="kind">
            <span class="marble marble--static" [attr.data-kind]="kind">
              {{ kindInfo(kind).glyph }}
            </span>
            {{ kindInfo(kind).title }}
          </span>
        }
      </div>

      <div class="marbles__lane" data-lane="imperative">
        <span class="marbles__label">Без RxJS</span>
        <div class="marbles__track">
          @if (impEvents().length === 0) {
            <span class="marbles__empty">—</span>
          }
          @for (e of impEvents(); track e.id) {
            <button
              type="button"
              class="marble"
              [attr.data-kind]="e.kind"
              [class.marble--selected]="selected()?.id === e.id"
              (click)="toggle(e)"
            >
              {{ kindInfo(e.kind).glyph }}
            </button>
          }
        </div>
      </div>

      <div class="marbles__lane" data-lane="reactive">
        <span class="marbles__label">С RxJS</span>
        <div class="marbles__track">
          @if (reaEvents().length === 0) {
            <span class="marbles__empty">—</span>
          }
          @for (e of reaEvents(); track e.id) {
            <button
              type="button"
              class="marble"
              [attr.data-kind]="e.kind"
              [class.marble--selected]="selected()?.id === e.id"
              (click)="toggle(e)"
            >
              {{ kindInfo(e.kind).glyph }}
            </button>
          }
        </div>
      </div>

      @if (selected(); as e) {
        <footer class="marbles__detail" [attr.data-kind]="e.kind">
          <span class="marbles__detail-glyph" [attr.data-kind]="e.kind">
            {{ kindInfo(e.kind).glyph }}
          </span>
          <div class="marbles__detail-text">
            <strong>{{ kindInfo(e.kind).title }}</strong>
            <p>{{ e.label }}</p>
            <small>
              {{ kindInfo(e.kind).description }}
              · {{ laneName(e.lane) }}
              · {{ time(e) }}
            </small>
          </div>
          <button
            type="button"
            class="marbles__detail-close"
            aria-label="Закрыть описание"
            (click)="selected.set(null)"
          >
            ×
          </button>
        </footer>
      }
    </section>
  `,
  styles: [
    `
      .marbles {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        padding: 14px 16px;
        background: var(--color-bg-elev);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
      }
      .marbles__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--color-text-dim);
      }
      .marbles__legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .marbles__lane {
        display: grid;
        grid-template-columns: 80px 1fr;
        align-items: center;
        gap: 12px;
      }
      .marbles__label {
        font-family: var(--font-mono);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-dim);
      }
      .marbles__track {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        padding: 5px 10px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 999px;
        overflow: hidden;
        position: relative;
      }
      .marbles__track::before {
        content: '';
        position: absolute;
        left: 10px;
        right: 10px;
        top: 50%;
        height: 1px;
        background: var(--color-border);
      }
      .marbles__empty {
        color: var(--color-text-dim);
        font-size: 12px;
        position: relative;
      }
      .marble {
        position: relative;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
        padding: 0;
        border: none;
        cursor: pointer;
        animation: marble-in 0.25s ease-out;
      }
      .marble--static {
        width: 18px;
        height: 18px;
        font-size: 10px;
        cursor: default;
        animation: none;
      }
      @keyframes marble-in {
        from {
          transform: scale(0);
        }
        to {
          transform: scale(1);
        }
      }
      .marble[data-kind='event'] {
        background: var(--color-orange);
        color: #171614;
      }
      .marble[data-kind='next'] {
        background: var(--color-green);
        color: #171614;
      }
      .marble[data-kind='success'] {
        background: var(--color-green);
        color: #171614;
      }
      .marble[data-kind='error'] {
        background: var(--color-red);
        color: #f7f6f2;
      }
      .marble[data-kind='cancelled'] {
        background: transparent;
        border: 1.5px dashed var(--color-text-dim);
        color: var(--color-text-dim);
      }
      .marble[data-kind='info'] {
        background: var(--color-bg-elev-2);
        border: 1px solid var(--color-border);
        color: var(--color-text-dim);
      }
      .marble--selected {
        outline: 2px solid var(--color-teal-light);
        outline-offset: 2px;
      }
      .marbles__detail {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 12px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-left: 3px solid var(--color-teal-light);
        border-radius: var(--radius-sm);
      }
      .marbles__detail[data-kind='error'] {
        border-left-color: var(--color-red);
      }
      .marbles__detail[data-kind='cancelled'] {
        border-left-color: var(--color-text-dim);
      }
      .marbles__detail[data-kind='next'],
      .marbles__detail[data-kind='success'] {
        border-left-color: var(--color-green);
      }
      .marbles__detail[data-kind='event'] {
        border-left-color: var(--color-orange);
      }
      .marbles__detail-glyph {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .marbles__detail-text {
        flex: 1;
        min-width: 0;
      }
      .marbles__detail-text strong {
        font-size: 13px;
      }
      .marbles__detail-text p {
        margin: 2px 0;
        font-size: 13.5px;
        overflow-wrap: anywhere;
      }
      .marbles__detail-text small {
        font-family: var(--font-mono);
        color: var(--color-text-dim);
        font-size: 11.5px;
      }
      .marbles__detail-close {
        background: transparent;
        border: none;
        color: var(--color-text-dim);
        font-size: 18px;
        line-height: 1;
        padding: 0 4px;
        cursor: pointer;
      }
      .marbles__detail-close:hover {
        color: var(--color-text);
      }
    `,
  ],
})
export class EventLogComponent {
  protected readonly log = inject(EventLogService);

  protected readonly legend = LEGEND_ORDER;
  protected readonly selected = signal<LogEvent | null>(null);

  protected impEvents() {
    return this.log.events().filter((e) => e.lane === 'imperative').slice(0, 20);
  }

  protected reaEvents() {
    return this.log.events().filter((e) => e.lane === 'reactive').slice(0, 20);
  }

  protected kindInfo(kind: LogKind) {
    return KIND_INFO[kind];
  }

  protected laneName(lane: Lane): string {
    return lane === 'imperative' ? 'дорожка «Без RxJS»' : 'дорожка «С RxJS»';
  }

  protected time(e: LogEvent): string {
    return new Date(e.timestamp).toLocaleTimeString();
  }

  protected toggle(e: LogEvent): void {
    this.selected.update((cur) => (cur?.id === e.id ? null : e));
  }
}
