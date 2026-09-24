import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.background-color]': 'hovered ? appHighlight() : null',
    '(mouseenter)': 'hovered = true',
    '(mouseleave)': 'hovered = false',
  },
})
export class HighlightDirective {
  readonly appHighlight = input('#fef3c7');

  protected hovered = false;
}
