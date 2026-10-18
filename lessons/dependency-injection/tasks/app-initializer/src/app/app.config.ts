import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { ConfigService } from './config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.load(),
      deps: [ConfigService],
      multi: true,
    },
  ],
};
