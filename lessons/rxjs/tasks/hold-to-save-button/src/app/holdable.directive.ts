import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { fromEvent, interval, map, merge, switchMap, takeUntil, takeWhile, tap } from 'rxjs';
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

  private start$ = fromEvent<Event>(this.el.nativeElement, 'pointerdown');

  private cancel$ = merge(
    fromEvent<Event>(this.el.nativeElement, 'pointerup'),
    fromEvent<Event>(this.el.nativeElement, 'pointerleave'),
    fromEvent<Event>(this.el.nativeElement, 'pointercancel'),
  );

  constructor() {
    const stepMs = 20;
    this.start$
      .pipe(
        switchMap(() =>
          interval(stepMs).pipe(
            map((tick) => Math.min(100, Math.round(((tick + 1) * stepMs / this.holdTime()) * 100))),
            takeWhile((progress) => progress < 100, true),
            takeUntil(this.cancel$.pipe(tap(() => this.holdProgress.emit(0)))),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((progress) => {
        this.holdProgress.emit(progress);

        if (progress === 100) {
          this.holdTimeEnd.emit();
        }
      });
  }
}
