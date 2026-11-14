import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concat, defer, EMPTY, fromEvent, interval, map, merge, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs';

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

  private readonly stepMs = 20;
  private readonly cooldownMs = 80;

  constructor() {
    const button = this.el.nativeElement;

    const start$ = fromEvent(button, 'pointerdown');
    const cancel$ = merge(
      fromEvent(button, 'pointerup'),
      fromEvent(button, 'pointerleave'),
      fromEvent(button, 'pointercancel'),
    );

    start$
      .pipe(
        switchMap(() => {
          let lastPercent = 0;

          return concat(
            interval(this.stepMs).pipe(
              map((tick) =>
                Math.min(
                  100,
                  (((tick + 1) * this.stepMs) / this.holdTime()) * 100,
                ),
              ),
              takeWhile((percent) => percent < 100, true),
              tap((percent) => (lastPercent = percent)),
              takeUntil(cancel$),
            ),
            defer(() =>
              lastPercent < 100 ? this.cooldown$(lastPercent) : EMPTY,
            ),
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

  private cooldown$(fromPercent: number) {
    const steps = this.cooldownMs / this.stepMs;

    return interval(this.stepMs).pipe(
      map((tick) => fromPercent - (fromPercent * (tick + 1)) / steps),
      take(steps),
    );
  }
}
