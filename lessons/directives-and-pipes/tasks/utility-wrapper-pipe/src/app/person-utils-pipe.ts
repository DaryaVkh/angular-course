import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtils, PUtil } from './person.utils';


@Pipe({ name: 'personUtils' })
export class PersonUtilsPipe implements PipeTransform {
  transform<KUtil extends keyof PUtil>(funcName: KUtil, ...args: Parameters<PUtil[KUtil]>): ReturnType<PUtil[KUtil]> {
    return (PersonUtils[funcName] as unknown as (...args: Parameters<PUtil[KUtil]>) => ReturnType<PUtil[KUtil]>)(...args);
  }
}
