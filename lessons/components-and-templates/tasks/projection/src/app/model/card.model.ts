export enum CardType {
  TEACHER,
  STUDENT,
  CITY,
}

/**
 * Контекст для `ng-template`, который каждая конкретная карточка (Teacher/Student/City)
 * передаёт в CardComponent для рендера одной строки списка (Задание 2, со звёздочкой).
 */
export interface CardRowContext<T> {
  $implicit: T;
  index: number;
}
