export type ProductCategory = 'electronics' | 'books' | 'home';

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly category: ProductCategory;
  readonly price: number;
  readonly emoji: string;
  readonly description: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  electronics: 'Электроника',
  books: 'Книги',
  home: 'Для дома',
};
