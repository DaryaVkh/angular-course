import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BooksService } from '../books.service';

@Component({
  selector: 'app-book-list',
  standalone: false,
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent {
  private readonly booksService = inject(BooksService);

  protected readonly search = signal('');

  protected readonly filteredBooks = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.booksService
      .all()
      .filter((book) => book.title.toLowerCase().includes(query));
  });
}
