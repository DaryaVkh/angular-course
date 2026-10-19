import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { APP_TIMER } from './data';

@Component({
  selector: 'timer',
  template: `
    Timer running {{ timer() }}
  `,
})
export class TimerComponent {
  private readonly app_timer = inject(APP_TIMER)
  timer = toSignal(interval(this.app_timer));
}
