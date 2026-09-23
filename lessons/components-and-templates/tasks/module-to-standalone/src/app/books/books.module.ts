import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookListComponent } from './book-list/book-list.component';
import { BooksRoutingModule } from './books-routing.module';
import { BooksService } from './books.service';

@NgModule({
  declarations: [BookListComponent, BookDetailComponent],
  imports: [SharedModule, FormsModule, BooksRoutingModule],
  providers: [BooksService],
})
export class BooksModule {}
