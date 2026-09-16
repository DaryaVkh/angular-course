import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CATEGORY_LABELS, Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly cart = inject(CartService);
  protected readonly categoryLabels = CATEGORY_LABELS;

  /** Данные приходят из resolve: { product: productResolver } в конфигурации маршрута. */
  protected readonly product = toSignal(
    this.route.data.pipe(map((data) => data['product'] as Product | null)),
    { initialValue: null },
  );
}
