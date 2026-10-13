import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

export const productResolver: ResolveFn<Product | null> = (route): Observable<Product | null> => {
  const productsService = inject(ProductsService);
  const router = inject(Router);

  const id = route.paramMap.get('id')!;

  return productsService.getById(id).pipe(
    map((product) => {
      if (!product) {
        router.navigate(['/catalog']);
        return null;
      }
      return product;
    }),
  );
};
