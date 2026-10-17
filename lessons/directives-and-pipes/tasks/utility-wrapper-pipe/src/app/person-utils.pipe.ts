import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtils } from './person.utils';

type PersonUtilsType = typeof PersonUtils;
type PersonUtilsFnName = keyof PersonUtilsType;

@Pipe({
  name: 'personUtils',
})
export class PersonUtilsPipe implements PipeTransform {
  transform<K extends PersonUtilsFnName>(
    fnName: K,
    ...args: Parameters<PersonUtilsType[K]>
  ): ReturnType<PersonUtilsType[K]> {
    const fn = PersonUtils[fnName] as (...args: unknown[]) => unknown;
    return fn(...args) as ReturnType<PersonUtilsType[K]>;
  }
}
