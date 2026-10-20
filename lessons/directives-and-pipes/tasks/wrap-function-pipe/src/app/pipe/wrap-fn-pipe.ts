import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn',
})
export class WrapFnPipe implements PipeTransform {
  transform<T, A extends unknown[], R>(
    value: T,
    fn: (value: T, ...args: A) => R,
    ...args: A
  ): R {
    return fn(value, ...args);
  }
}
