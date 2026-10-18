import { Directive, inject, input, OnInit } from '@angular/core';
import { CurrencyService } from './currency.service';

@Directive({
  selector: '[currencyCode]',
  providers: [CurrencyService],
})
export class CurrencyCodeDirective implements OnInit {
  private readonly currencyService = inject(CurrencyService);

  readonly currencyCode = input.required<string>();

  ngOnInit(): void {
    this.currencyService.patchState({ code: this.currencyCode() });
  }
}
