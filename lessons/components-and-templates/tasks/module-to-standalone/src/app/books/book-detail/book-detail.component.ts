import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { BooksService } from '../books.service';

@Component({
  selector: 'app-book-detail',
  standalone: false,
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent {
  private readonly booksService = inject(BooksService);

  // Заполняется из параметра маршрута благодаря bindToComponentInputs
  readonly id = input.required({ transform: numberAttribute });

  protected readonly book = computed(() =>
    this.booksService.getById(this.id()),
  );
}
