import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: false,
  host: {
    '[style.backgroundColor]': 'hovered ? appHighlight() : null',
    '(mouseenter)': 'hovered = true',
    '(mouseleave)': 'hovered = false',
  },
})
export class HighlightDirective {
  readonly appHighlight = input('#fef3c7');

  protected hovered = false;
}
