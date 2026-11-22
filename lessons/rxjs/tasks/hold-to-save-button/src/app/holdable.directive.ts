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
  private readonly stepMs = 20;

  private readonly start$ = fromEvent(this.el.nativeElement, 'pointerdown');
  private readonly cancel$ = merge(
    fromEvent(this.el.nativeElement, 'pointerup'),
    fromEvent(this.el.nativeElement, 'pointerleave'),
    fromEvent(this.el.nativeElement, 'pointercancel'),
  );

  constructor() {
    this.start$
      .pipe(
        switchMap(() => this.hold$()),
        takeUntilDestroyed(),
      )
      .subscribe((percent) => {
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
      takeUntil(
        this.cancel$.pipe(tap(() => this.holdProgress.emit(0))),
      ),
    );
  }
}