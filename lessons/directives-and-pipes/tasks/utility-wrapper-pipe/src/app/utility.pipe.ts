import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utility',
})
export class UtilityPipe implements PipeTransform {
  transform<
    T extends Record<string, (...args: any[]) => any>,
    K extends keyof T,
  >(utils: T, fnName: K, ...args: Parameters<T[K]>): ReturnType<T[K]> {
    return utils[fnName](...args);
  }
}
