import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn'
})
export class WrapFnPipe implements PipeTransform {

  transform<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => TResult, ...args: TArgs): TResult {
    return fn(...args);
  }

}
