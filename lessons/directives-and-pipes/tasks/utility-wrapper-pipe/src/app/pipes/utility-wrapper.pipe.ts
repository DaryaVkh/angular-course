import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtils } from '../person.utils';

type UtilityMap = typeof PersonUtils;
type UtilityName = keyof UtilityMap;

type UtilityArgsMap = {
  [K in UtilityName]: Parameters<UtilityMap[K]>;
};

type UtilityReturnMap = {
  [K in UtilityName]: ReturnType<UtilityMap[K]>;
};

@Pipe({
  name: 'utilityWrapper',
})
export class UtilityWrapperPipe implements PipeTransform {
  transform<K extends UtilityName>(fnName: K, ...args: UtilityArgsMap[K]): UtilityReturnMap[K] {
    const fn = PersonUtils[fnName] as (
      ...args: unknown[]
    ) => UtilityReturnMap[K];

    if (typeof fn !== 'function') {
      throw new Error(`Utility function "${String(fnName)}" does not exist.`);
    }

    return fn(...(args as unknown[]));
  }
}
