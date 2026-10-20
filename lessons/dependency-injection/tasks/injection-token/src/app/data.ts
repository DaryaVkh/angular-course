import { InjectionToken } from '@angular/core';

export const DEFAULT_TIMER = 1000;

export const TIMER = new InjectionToken<number>('timer', {
  providedIn: 'root',
  factory: () => DEFAULT_TIMER,
});
