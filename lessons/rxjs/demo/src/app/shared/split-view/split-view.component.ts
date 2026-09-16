import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { CodeSnippetComponent } from '../code-snippet/code-snippet.component';

/**
 * Двухколоночный layout: слева «без операторов», справа «с операторами».
 * Контент передаётся через content projection в слоты `#imperative` и `#reactive`.
 * Клик по кнопке «Код» в шапке дорожки раскрывает соответствующий фрагмент кода.
 */
@Component({
  selector: 'app-split-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, CodeSnippetComponent],
  template: `
    <div class="split-view">
      <div class="lane lane--imperative">
        <header class="lane__header">
          <span class="lane__title">{{ imperativeTitle() }}</span>
          <button
            tuiButton
            type="button"
            size="xs"
            appearance="outline"
            [class.lane__code-btn--active]="showImpCode()"
            (click)="showImpCode.set(!showImpCode())"
          >
            {{ showImpCode() ? 'Скрыть код' : 'Показать код' }}
          </button>
        </header>
        @if (showImpCode()) {
          <app-code-snippet [code]="imperativeCode()" />
        }
        <div class="lane__body">
          <ng-content select="[slot=imperative]" />
        </div>
      </div>
      <div class="lane lane--reactive">
        <header class="lane__header">
          <span class="lane__title">{{ reactiveTitle() }}</span>
          <button
            tuiButton
            type="button"
            size="xs"
            appearance="outline"
            [class.lane__code-btn--active]="showReaCode()"
            (click)="showReaCode.set(!showReaCode())"
          >
            {{ showReaCode() ? 'Скрыть код' : 'Показать код' }}
          </button>
        </header>
        @if (showReaCode()) {
          <app-code-snippet [code]="reactiveCode()" />
        }
        <div class="lane__body">
          <ng-content select="[slot=reactive]" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .lane__title {
        font-weight: 600;
        font-size: 13px;
      }
      .lane__code-btn--active {
        color: var(--tui-text-primary);
      }
    `,
  ],
})
export class SplitViewComponent {
  readonly imperativeTitle = input<string>('Без операторов');
  readonly reactiveTitle = input<string>('С операторами');
  readonly imperativeCode = input<string>('');
  readonly reactiveCode = input<string>('');

  protected readonly showImpCode = signal(false);
  protected readonly showReaCode = signal(false);
}