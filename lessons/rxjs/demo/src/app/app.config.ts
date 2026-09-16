import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideTaiga } from '@taiga-ui/core';
import { TRANSPORT } from './core/transport';
import { FakeTransportService } from './core/transport.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideTaiga({ mode: 'dark' }),
    // Связываем абстракцию Transport с её фейковой реализацией.
    // В тестах сценариев мокаем TRANSPORT прямо в TestBed.
    { provide: TRANSPORT, useExisting: FakeTransportService },
  ],
};