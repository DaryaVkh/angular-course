import { InjectionToken } from '@angular/core';

export const DEFAULT_TIMER = 1000;

export const TIMER_TOKEN = new InjectionToken<number>('TIMER_TOKEN', {
  providedIn: 'root',
  factory: () => DEFAULT_TIMER,
});
