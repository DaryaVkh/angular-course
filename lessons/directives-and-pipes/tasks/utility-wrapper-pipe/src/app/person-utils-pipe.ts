import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtil, PersonUtils } from './person.utils';

@Pipe({
  name: 'personUtils',
})
export class PersonUtilsPipe implements PipeTransform {
  transform<K extends keyof PersonUtil>(
    util: K,
    ...args: Parameters<PersonUtil[K]>
  ): ReturnType<PersonUtil[K]> {
    return (PersonUtils[util] as any)(...args);
  }
}
