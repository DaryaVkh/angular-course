import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtils } from '../app/person.utils';

type UtilityFn<K extends keyof typeof PersonUtils> = (typeof PersonUtils)[K];

@Pipe({
  name: 'utilityWrapper',
})
export class UtilityWrapperPipe implements PipeTransform {
  transform<K extends keyof typeof PersonUtils>(
    functionName: K,
    ...args: Parameters<UtilityFn<K>>
  ): ReturnType<UtilityFn<K>> {
    const fn = PersonUtils[functionName] as unknown as (
      ...args: Parameters<UtilityFn<K>>
    ) => ReturnType<UtilityFn<K>>;
    return fn(...args);
  }
}
