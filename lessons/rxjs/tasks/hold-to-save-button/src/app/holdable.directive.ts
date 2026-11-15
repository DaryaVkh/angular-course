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
    const start$ = merge(
      fromEvent(this.el.nativeElement, 'pointerdown'),
      fromEvent(this.el.nativeElement, 'mousedown'),
    );
    const cancel$ = merge(
      fromEvent(this.el.nativeElement, 'pointerup'),
      fromEvent(this.el.nativeElement, 'pointerleave'),
      fromEvent(this.el.nativeElement, 'pointercancel'),
    );

    start$
      .pipe(
        switchMap(() =>
          interval(10).pipe(
            map((tick) =>
              Math.min(100, ((tick + 1) * 10 * 100) / this.holdTime()),
            ),
            takeWhile((percent) => percent < 100, true),
            takeUntil(cancel$.pipe(tap(() => this.holdProgress.emit(0)))),
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
  }
}
