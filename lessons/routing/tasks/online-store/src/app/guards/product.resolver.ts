import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
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
  return of(null);
};
