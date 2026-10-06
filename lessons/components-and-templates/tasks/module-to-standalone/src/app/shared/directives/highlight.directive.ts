import { Directive, input } from '@angular/core';

const DEFAULT_HIGHLIGHT = '#fef3c7';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.backgroundColor]': 'hovered ? appHighlight() : null',
    '(mouseenter)': 'hovered = true',
    '(mouseleave)': 'hovered = false',
  },
})
export class HighlightDirective {
  readonly appHighlight = input(DEFAULT_HIGHLIGHT, {
    transform: (color: string) => color || DEFAULT_HIGHLIGHT,
  });

  protected hovered = false;
}
