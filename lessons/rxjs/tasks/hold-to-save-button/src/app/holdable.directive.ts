import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  finalize,
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
export class HoldableDirective implements OnInit {
  /** Длительность удержания кнопки в миллисекундах */
  readonly holdTime = input<number>(1000);

  /** Прогресс удержания от 0 до 100 */
  readonly holdProgress = output<number>();

  /** Событие успешного завершения удержания */
  readonly holdTimeEnd = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  start$ = merge(
    fromEvent(this.el.nativeElement, 'pointerdown'),
    fromEvent(this.el.nativeElement, 'mousedown'),
  );

  cancel$ = merge(
    fromEvent(this.el.nativeElement, 'pointerup'),
    fromEvent(this.el.nativeElement, 'pointerleave'),
    fromEvent(this.el.nativeElement, 'pointercancel'),
  );

  ngOnInit() {
    this.start$
      .pipe(
        switchMap(() =>
          interval(10).pipe(
            takeUntil(this.cancel$),
            map((n) =>
              Math.min(Math.floor(((n * 10) / this.holdTime()) * 100), 100),
            ),
            tap((percent) => {
              this.holdProgress.emit(percent);

              if (percent === 100) this.holdTimeEnd.emit();
            }),
            takeWhile((percent) => percent < 100),
            finalize(() => this.holdProgress.emit(0)),
          ),
        ),
      )
      .subscribe();
  }
}
