import { InjectionToken } from '@angular/core';

export const DEFAULT_TIMER = 1000;
export const INTERVAL = new InjectionToken<number>('intervalTimer',{
  providedIn: 'root',
  factory: () => DEFAULT_TIMER,
});
