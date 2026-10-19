import { InjectionToken } from '@angular/core';

export const DEFAULT_TIMER = 1000;
export const APP_TIMER = new InjectionToken<number>('app.timer', {
  providedIn: 'root',
  factory: () => DEFAULT_TIMER,
});
