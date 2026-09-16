import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Показывает фрагмент кода подхода (imperative | reactive).
 * Используется в SplitView: клик по заголовку дорожки раскрывает код.
 */
@Component({
  selector: 'app-code-snippet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre><code>{{ code() }}</code></pre>
  `,
  styles: [
    `
      pre {
        margin: 0;
        padding: 10px 12px;
        background: var(--tui-background-base);
        border: 1px solid var(--tui-border-normal);
        border-radius: 8px;
        overflow: auto;
        max-height: 320px;
        font-size: 12px;
        line-height: 1.55;
        text-align: left;
      }
    `,
  ],
})
export class CodeSnippetComponent {
  readonly code = input.required<string>();
}
