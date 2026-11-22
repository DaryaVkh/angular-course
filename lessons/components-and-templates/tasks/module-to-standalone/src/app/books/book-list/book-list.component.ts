import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BooksService } from '../books.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  imports: [RouterLink, HighlightDirective, TruncatePipe, CardComponent, FormsModule],
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
