import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BooksService } from '../books.service';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/ui/card/card.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { RouterLink } from '@angular/router';
import { HighlightDirective } from '../../shared/directives/highlight.directive';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CardComponent,
    TruncatePipe,
    RouterLink,
    HighlightDirective,
  ],
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
