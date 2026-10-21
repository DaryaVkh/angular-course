import { InjectionToken } from '@angular/core';

export const DEFAULT_TIMER = 1000;

export const TIMER_INTERVAL = new InjectionToken<number>('TIMER_INTERVAL', {
  providedIn: 'root',
  factory: () => DEFAULT_TIMER,
});
