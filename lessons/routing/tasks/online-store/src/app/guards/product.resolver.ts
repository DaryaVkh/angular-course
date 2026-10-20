import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

/**
 * Требование:
 * - По id из параметров роута загрузить товар через productsService.getById(id).
 * - Если товар не найден — вызвать router.navigate(['/catalog']) и вернуть of(null).
 * - Если найден — вернуть Observable<Product>.
 */
export const productResolver: ResolveFn<Product | null> = (route): Observable<Product | null> => {
  const productsService = inject(ProductsService);
  const router = inject(Router);

  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/catalog']);
    return of(null);
  }

  return productsService.getById(id).pipe(
    map(product => {
      if (!product) {
        router.navigate(['/catalog']);
        return null;
      }

      return product;
    })
  );
};
