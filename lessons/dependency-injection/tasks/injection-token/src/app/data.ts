import { InjectionToken } from '@angular/core';

export const DEFAULT_TIMER = 1000;

export const INJECTED_TIMER = new InjectionToken<number>('timer interval', {factory: () => DEFAULT_TIMER});
