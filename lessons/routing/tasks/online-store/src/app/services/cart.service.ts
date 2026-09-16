import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<readonly CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  add(product: Product): void {
    const items = this._items();
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex >= 0) {
      const next = [...items];
      next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 };
      this._items.set(next);
      return;
    }

    this._items.set([...items, { product, quantity: 1 }]);
  }

  remove(productId: string): void {
    this._items.set(this._items().filter((item) => item.product.id !== productId));
  }

  clear(): void {
    this._items.set([]);
  }
}
