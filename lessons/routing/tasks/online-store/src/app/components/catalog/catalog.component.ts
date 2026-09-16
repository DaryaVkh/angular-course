import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { CATEGORY_LABELS, Product, ProductCategory } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductsService } from '../../services/products.service';

const ALL_CATEGORIES: readonly ProductCategory[] = ['electronics', 'books', 'home'];

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.component.html',
})
export class CatalogComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);

  protected readonly cart = inject(CartService);
  protected readonly categories = ALL_CATEGORIES;
  protected readonly categoryLabels = CATEGORY_LABELS;

  /**
   * TODO: сейчас категория всегда null, поэтому фильтр по факту не работает —
   * какую бы ссылку вы ни нажали, список товаров не меняется.
   *
   * Замените `null as ProductCategory | null` на чтение query parameter
   * `category` из this.route.queryParamMap
   */
  protected readonly activeCategory = toSignal(
    this.route.queryParamMap.pipe(map(() => null as ProductCategory | null)),
    { initialValue: null },
  );

  protected readonly products = toSignal(
    toObservable(this.activeCategory).pipe(switchMap((category) => this.productsService.getAll(category))),
    { initialValue: [] as readonly Product[] },
  );
}
