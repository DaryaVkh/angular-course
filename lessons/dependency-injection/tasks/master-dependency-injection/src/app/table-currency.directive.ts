import { Directive, inject, input, OnInit } from '@angular/core';
import { CurrencyService } from './currency.service';

@Directive({
  selector: '[tableCurrency]',
  providers: [CurrencyService],
})

export class TableCurrencyDirective implements OnInit {
  readonly tableCurrency = input.required<string>();
  private readonly currencyService = inject(CurrencyService);

  ngOnInit(): void {
    this.currencyService.patchState({ code: this.tableCurrency()});
  }
}
