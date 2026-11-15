import { Directive, ElementRef, inject, input, output } from '@angular/core';
import {
  concat,
  defer,
  EMPTY,
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  switchMap, take,
  takeUntil,
  takeWhile,
  tap
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    const button = this.el.nativeElement;
    const step = 20;
    const start$ = fromEvent(button, 'pointerdown');
    const cancel$ = merge(
      fromEvent(button, 'pointerup'),
      fromEvent(button, 'pointerleave'),
      fromEvent(button, 'pointercancel'),
    );

    start$
      .pipe(
        switchMap(() => {
          this.holdProgress.emit(0);
          const holdDuration = this.holdTime();
          let lastProgress = 0;
          return concat(
            interval(step).pipe(
              map((tick) =>
                Math.min(100, (((tick + 1) * step) / holdDuration) * 100),
              ),
              takeWhile((percent) => percent < 100, true),
              tap((percent) => {
                lastProgress = percent;
              }),
              takeUntil(cancel$),
            ),
            defer(() => this.resetProgress(lastProgress)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((percent) => {
        this.holdProgress.emit(percent);
        if (percent === 100) {
          this.holdTimeEnd.emit();
        }
      });
  }

  private resetProgress(progress: number): Observable<number> {
    const steps = 8;
    return progress === 0 || progress === 100
      ? EMPTY
      : interval(10).pipe(
        take(steps),
        map((tick) => progress * (1 - (tick + 1) / steps)),);
  }
}
