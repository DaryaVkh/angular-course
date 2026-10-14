import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtils } from './person.utils';

type PersonUtilsType = typeof PersonUtils;
type UtlityKeys = keyof PersonUtilsType;

@Pipe({
  name: 'utilityFn',
})
export class UtilityFnPipe implements PipeTransform {
  transform<K extends UtlityKeys>(
    value: K,
    ...args: Parameters<PersonUtilsType[K]>
  ): ReturnType<PersonUtilsType[K]> {
    const fn = PersonUtils[value] as any;
    return fn(...args);
  }
}
