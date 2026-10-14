import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn',
})
export class WrapFnPipe implements PipeTransform {
  transform<A extends any[], R>(
    func: (...args: A) => R,
    thisArg: object | null,
    ...args: A
  ): R {
    return func.apply(thisArg, args);
  }
}
