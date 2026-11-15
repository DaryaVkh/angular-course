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
    const isHoldKey = (event: KeyboardEvent) =>
      event.key === ' ' || event.key === 'Enter';

    const start$ = merge(
      fromEvent(element, 'pointerdown'),
      fromEvent<KeyboardEvent>(element, 'keydown').pipe(
        filter(isHoldKey),
        tap((event) => event.preventDefault()),
        filter((event) => !event.repeat),
      ),
    );
    const cancel$ = merge(
      fromEvent(element, 'pointerup'),
      fromEvent(element, 'pointerleave'),
      fromEvent(element, 'pointercancel'),
      fromEvent(element, 'blur'),
      fromEvent<KeyboardEvent>(element, 'keyup').pipe(
        filter(isHoldKey),
        tap((event) => event.preventDefault()),
      ),
    );

    start$
      .pipe(
        switchMap(() => {
          const duration = this.holdTime();

          return interval(stepMs).pipe(
            map((tick) => Math.min(100, (((tick + 1) * stepMs) / duration) * 100)),
            startWith(0),
            takeWhile((progress) => progress < 100, true),
            takeUntil(cancel$.pipe(tap(() => this.holdProgress.emit(0)))),
          );
        }),
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
