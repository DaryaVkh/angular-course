import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DEFAULT_TIMER, TIMER } from './data';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: TIMER, useValue: DEFAULT_TIMER },
    provideRouter([
      { path: '', pathMatch: 'full', redirectTo: 'video' },
      { path: 'video', loadComponent: () => import('./video.component') },
      { path: 'phone', loadComponent: () => import('./phone.component') },
    ]),
  ],
};
