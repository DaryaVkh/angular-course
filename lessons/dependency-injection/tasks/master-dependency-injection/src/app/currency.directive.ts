import { Directive, effect, inject, input } from '@angular/core';
import { CurrencyService } from './currency.service';

@Directive({
  selector: '[currency]',
  providers: [CurrencyService],
})
export class CurrencyDirective {
  readonly currency = input('EUR');
  private readonly currencyService = inject(CurrencyService);

  constructor() {
    effect(() => {
      this.currencyService.patchState({ code: this.currency() });
    });
  }
}