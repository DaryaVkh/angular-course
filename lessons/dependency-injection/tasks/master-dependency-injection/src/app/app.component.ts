import { TableComponent } from '@angular-challenges/shared/ui';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, inject, input, OnInit } from '@angular/core';
import { CurrencyPipe } from './currency.pipe';
import { CurrencyService } from './currency.service';
import { Product, products } from './product.model';

interface ProductContext {
  $implicit: Product;
}

@Directive({
  selector: 'ng-template[product]',
})
export class ProductDirective {
  static ngTemplateContextGuard(
    dir: ProductDirective,
    ctx: unknown,
  ): ctx is ProductContext {
    return true;
  }
}

@Directive({
  selector: '[appCurrency]',
  providers: [CurrencyService],
})
export class CurrencyDirective implements OnInit {
  private readonly currencyService = inject(CurrencyService);

  readonly appCurrency = input.required<string>();

  ngOnInit(): void {
    this.currencyService.setState({ code: this.appCurrency() });
  }
}

@Component({
  imports: [TableComponent, CurrencyPipe, AsyncPipe, ProductDirective, CurrencyDirective],
  selector: 'app-root',
  template: `
    <table [items]="products">
      <ng-template #header>
        <tr>
          @for (col of displayedColumns; track $index) {
            <th>
              {{ col }}
            </th>
          }
        </tr>
      </ng-template>
      <ng-template #body product let-product>
        <tr [appCurrency]="product.currencyCode">
          <td>{{ product.name }}</td>
          <td>{{ product.priceA | currency | async }}</td>
          <td>{{ product.priceB | currency | async }}</td>
          <td>{{ product.priceC | currency | async }}</td>
        </tr>
      </ng-template>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  products = products;
  displayedColumns = ['name', 'priceA', 'priceB', 'priceC'];
}
