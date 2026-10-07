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

  protected readonly activeCategory = toSignal(
    this.route.queryParamMap.pipe(
      map((qp) => {
        const raw = qp.get('category');
        return raw && (ALL_CATEGORIES as readonly string[]).includes(raw)
          ? (raw as ProductCategory)
          : null;
      }),
    ),
    { initialValue: null as ProductCategory | null },
  );

  protected readonly products = toSignal(
    toObservable(this.activeCategory).pipe(switchMap((category) => this.productsService.getAll(category))),
    { initialValue: [] as readonly Product[] },
  );
}
