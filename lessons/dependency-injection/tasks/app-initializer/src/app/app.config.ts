import { ApplicationConfig } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './config.service';


export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (cfg: ConfigService) => () => cfg.load(),
      deps: [ConfigService],
      multi: true,
    }
  ],
};
