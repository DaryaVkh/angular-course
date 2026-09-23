import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Главная' },
  {
    path: 'books',
    loadChildren: () =>
      import('./books/books.module').then((m) => m.BooksModule),
  },
  {
    path: 'authors',
    loadChildren: () =>
      import('./authors/authors.module').then((m) => m.AuthorsModule),
  },
  { path: '**', component: NotFoundComponent, title: 'Не найдено' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
