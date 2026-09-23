import { Injectable, signal } from '@angular/core';
import { Book } from './book.model';

// Сервис намеренно НЕ providedIn: 'root' — он предоставляется в BooksModule.
@Injectable()
export class BooksService {
  private readonly books = signal<Book[]>([
    {
      id: 1,
      title: 'Мастер и Маргарита',
      authorId: 1,
      year: 1967,
      description:
        'Роман о визите дьявола в Москву 1930-х годов, любви Мастера и Маргариты и истории Понтия Пилата.',
    },
    {
      id: 2,
      title: 'Собачье сердце',
      authorId: 1,
      year: 1987,
      description:
        'Повесть о профессоре Преображенском, который пересадил бездомному псу человеческий гипофиз.',
    },
    {
      id: 3,
      title: 'Преступление и наказание',
      authorId: 2,
      year: 1866,
      description:
        'Роман о бывшем студенте Родионе Раскольникове, совершившем убийство, и его душевных муках.',
    },
    {
      id: 4,
      title: 'Идиот',
      authorId: 2,
      year: 1869,
      description:
        'История князя Мышкина — «положительно прекрасного человека» в мире страстей и денег.',
    },
    {
      id: 5,
      title: 'Пикник на обочине',
      authorId: 3,
      year: 1972,
      description:
        'Фантастическая повесть о сталкерах, пробирающихся в Зону за артефактами пришельцев.',
    },
  ]);

  readonly all = this.books.asReadonly();

  getById(id: number): Book | undefined {
    return this.books().find((book) => book.id === id);
  }
}
