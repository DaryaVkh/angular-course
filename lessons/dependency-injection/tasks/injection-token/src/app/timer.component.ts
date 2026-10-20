import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { TIMER_INTERVAL } from './data';

@Component({
  selector: 'timer',
  template: `
    Timer running {{ timer() }}
  `,
})
export class TimerComponent {
  timer = toSignal(
    interval(inject(TIMER_INTERVAL)),
    { initialValue: 0 }
  );
}
