import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { ConfigService } from './config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => {
        return configService.load.bind(configService);
      },
      multi: true,
      deps: [ConfigService],
    },
    // TODO: добавь APP_INITIALIZER чтобы ConfigService.load() вызвался до старта приложения
  ],
};
