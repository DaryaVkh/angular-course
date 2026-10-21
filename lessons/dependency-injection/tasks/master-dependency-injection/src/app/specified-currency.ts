import { Directive, effect, inject, input } from '@angular/core';
import { CurrencyService } from './currency.service';

@Directive({
  selector: '[specifiedCurrency]',
  providers: [CurrencyService],
})
export class SpecifiedCurrency {
  readonly specifiedCurrency = input('EUR');
  private readonly currencyService = inject(CurrencyService);

  constructor() {
    effect(() => {
      this.currencyService.patchState({ code: this.specifiedCurrency() });
    });
  }
}
