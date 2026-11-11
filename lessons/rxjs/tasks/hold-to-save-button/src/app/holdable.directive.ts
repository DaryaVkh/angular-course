import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  fromEvent,
  interval,
  map,
  merge,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';

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

  constructor() {
    const element = this.el.nativeElement;
    const stepMs = 20;

    const start$ = fromEvent(element, 'pointerdown');
    const cancel$ = merge(
      fromEvent(element, 'pointerup'),
      fromEvent(element, 'pointerleave'),
      fromEvent(element, 'pointercancel'),
    );

    start$
      .pipe(
        switchMap(() =>
          interval(stepMs).pipe(
            map((tick) =>
              Math.min(100, (((tick + 1) * stepMs) / this.holdTime()) * 100),
            ),
            takeWhile((percent) => percent < 100, true),
            takeUntil(cancel$),
            tap((percent) => {
              this.holdProgress.emit(percent);
              if (percent === 100) {
                this.holdTimeEnd.emit();
              }
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    cancel$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.holdProgress.emit(0));
  }
}
