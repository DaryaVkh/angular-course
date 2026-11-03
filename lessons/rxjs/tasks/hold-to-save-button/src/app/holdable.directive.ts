import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  filter,
  fromEvent,
  interval,
  map,
  merge,
  startWith,
  switchMap,
  take,
  takeUntil,
  takeWhile,
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

  private readonly stepMs = 20;
  private readonly cooldownMs = 200;
  private progress = 0;

  private readonly start$ = fromEvent(this.el.nativeElement, 'pointerdown');
  private readonly cancel$ = merge(
    fromEvent(this.el.nativeElement, 'pointerup'),
    fromEvent(this.el.nativeElement, 'pointerleave'),
    fromEvent(this.el.nativeElement, 'pointercancel'),
  );

  constructor() {
    this.start$
      .pipe(
        switchMap(() =>
          merge(this.hold$(), this.cooldown$()).pipe(startWith(0)),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((percent) => {
        this.progress = percent;
        this.holdProgress.emit(percent);
        if (percent === 100) {
          this.holdTimeEnd.emit();
        }
      });
  }

  private hold$() {
    return interval(this.stepMs).pipe(
      map((tick) => {
        const elapsed = (tick + 1) * this.stepMs;
        return Math.min(100, (elapsed / this.holdTime()) * 100);
      }),
      takeWhile((percent) => percent < 100, true),
      takeUntil(this.cancel$),
    );
  }

  private cooldown$() {
    return this.cancel$.pipe(
      take(1),
      filter(() => this.progress < 100),
      switchMap(() => {
        const from = this.progress;
        return interval(this.stepMs).pipe(
          map((tick) => {
            const elapsed = (tick + 1) * this.stepMs;
            return Math.max(0, from - (elapsed / this.cooldownMs) * 100);
          }),
          takeWhile((percent) => percent > 0, true),
        );
      }),
    );
  }
}
