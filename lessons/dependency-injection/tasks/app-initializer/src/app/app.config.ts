import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { ConfigService } from './config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useValue: () => {
        const config = inject(ConfigService);
        return config.load();
      },
      multi: true,
    },
  ],
};
