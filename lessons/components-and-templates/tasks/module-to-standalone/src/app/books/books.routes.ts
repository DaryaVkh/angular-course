import { Routes } from '@angular/router';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookListComponent } from './book-list/book-list.component';
import { BooksService } from './books.service';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    providers: [BooksService],
    children: [
      { path: '', component: BookListComponent, title: 'Книги' },
      { path: ':id', component: BookDetailComponent, title: 'Книга' },
    ],
  },
];
