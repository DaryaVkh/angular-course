import { Directive } from '@angular/core';

/**
 * Маркер именованного слота карточки.
 *
 * Итоговый селектор остаётся тем же, что и в разметке конкретных карточек
 * (`<h3 card-header>Учителя</h3>`), а сама директива позволяет `CardComponent`
 * узнать, что заголовок передан, через `@ContentChild(CardHeaderDirective)`.
 */
@Directive({
  selector: '[card-header]',
})
export class CardHeaderDirective {}
