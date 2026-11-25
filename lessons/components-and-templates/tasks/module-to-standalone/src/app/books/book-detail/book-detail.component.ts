import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BooksService } from '../books.service';

@Component({
  selector: 'app-book-detail',
  imports: [CardComponent, RouterLink],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent {
  private readonly booksService = inject(BooksService);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly book = computed(() =>
    this.booksService.getById(this.id()),
  );
}
