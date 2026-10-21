import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { HomeComponent } from './home/home.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Главная' },
  {
    path: 'books',
    loadChildren: () =>
      import('./books/books.routes').then((m) => m.BOOKS_ROUTES),
  },
  {
    path: 'authors',
    loadComponent: () =>
      import('./authors/author-list/author-list.component').then(
        (m) => m.AuthorListComponent,
      ),
    title: 'Авторы',
  },
  { path: '**', component: NotFoundComponent, title: 'Не найдено' },
];
