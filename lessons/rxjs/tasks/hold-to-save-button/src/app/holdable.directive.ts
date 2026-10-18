import { Directive, ElementRef, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appHoldable]',
})
export class HoldableDirective {
  /** Длительность удержания кнопки в миллисекундах */
  readonly holdTime = input<number>(1000);

  /** Прогресс удержания от 0 до 100 */
  readonly holdProgress = output<number>();

  /** Событие успешного завершения удержания */
  readonly holdTimeEnd = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  // TODO: Шаг 1 — Создайте потоки начала удержания (pointerdown / mousedown)
  //               и отмены удержания (pointerup, pointerleave, pointercancel).
  // TODO: Шаг 2 — По клику запускайте таймер (interval) через switchMap и
  //               останавливайте его при событии отмены (takeUntil).
  // TODO: Шаг 3 — Пересчитывайте прошедшее время в процент [0..100], эмитьте
  //               его в holdProgress (при отмене сбрасывайте в 0), а при
  //               достижении 100% вызывайте holdTimeEnd.emit().
}
