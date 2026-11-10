import { Directive, ElementRef, inject, input, OnDestroy, output, signal } from '@angular/core';
import { EMPTY, fromEvent, interval, map, merge, scan, startWith, Subscription, switchMap, takeUntil, takeWhile, tap } from 'rxjs';

@Directive({
  selector: '[appHoldable]',
  exportAs: 'appHoldable',
})
export class Holdable implements OnDestroy {
  readonly holdTime = input.required<number>();
  readonly holdTimeEnd = output<void>();

  readonly progress = signal(0);

  private el = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  private nativeEl = this.el.nativeElement;

  private down$ = fromEvent(this.nativeEl, 'pointerdown');
  private up$ = fromEvent(this.nativeEl, 'pointerup');
  private leave$ = fromEvent(this.nativeEl, 'pointerleave');
  private cancel$ = fromEvent(this.nativeEl, 'pointercancel');
  private stop$ = merge(this.up$, this.leave$, this.cancel$);

  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.down$.pipe(
      tap(() => this.progress.set(100)),
      switchMap(() => {
        const duration = this.holdTime();
        if (duration <= 0) {
            this.progress.set(0);
            this.holdTimeEnd.emit();
            return EMPTY;
          }

          const tick = 16;

          return interval(tick).pipe(
            startWith(0),
            scan((elapsed) => elapsed + tick, 0),
            map((elapsed) => Math.max(0, 100 - (elapsed / duration) * 100)),
            takeWhile((progress) => progress > 0, true),
            takeUntil(this.stop$),
            tap((progress) => this.progress.set(progress)),
            tap((progress) => {
              if (progress === 0) {
                this.holdTimeEnd.emit();
              }
            })
          );
        })
      )
      .subscribe({
        complete: () => this.progress.set(0),
      });
    
    this.stop$.subscribe(() => {
      this.progress.set(0);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
