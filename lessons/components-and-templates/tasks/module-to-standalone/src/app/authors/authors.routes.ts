import { Routes } from '@angular/router';
import { AuthorListComponent } from './author-list/author-list.component';

export const AUTHORS_ROUTES: Routes = [
  { path: '', component: AuthorListComponent, title: 'Авторы' },
];
