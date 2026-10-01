import { Component } from '@angular/core';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { CardComponent } from '../../shared/ui/card/card.component';
import { Author } from '../author.model';

@Component({
  selector: 'app-author-list',
  templateUrl: './author-list.component.html',
  styleUrl: './author-list.component.scss',
  imports: [CardComponent, HighlightDirective, TruncatePipe],
})
export class AuthorListComponent {
  protected readonly authors: Author[] = [
    {
      id: 1,
      name: 'Михаил Булгаков',
      bio: 'Русский писатель и драматург, автор «Мастера и Маргариты», «Белой гвардии» и «Собачьего сердца».',
    },
    {
      id: 2,
      name: 'Фёдор Достоевский',
      bio: 'Один из самых значительных русских писателей XIX века, автор «Братьев Карамазовых» и «Бесов».',
    },
    {
      id: 3,
      name: 'Аркадий и Борис Стругацкие',
      bio: 'Братья-соавторы, классики советской научной фантастики: «Трудно быть богом», «Понедельник начинается в субботу».',
    },
  ];

  protected trackById(_: number, author: Author): number {
    return author.id;
  }
}
