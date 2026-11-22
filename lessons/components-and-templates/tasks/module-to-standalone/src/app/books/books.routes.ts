import { Routes } from '@angular/router';
import { BooksService } from './books.service';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookListComponent } from './book-list/book-list.component';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    providers: [BooksService],
    children: [
      { path: '', component: BookListComponent },
      { path: ':id', component: BookDetailComponent },
    ],
  },
];