import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BooksService } from '../books.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { RouterLink } from '@angular/router';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-list',
  imports: [CardComponent, TruncatePipe, RouterLink, HighlightDirective, FormsModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BooksService],
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
