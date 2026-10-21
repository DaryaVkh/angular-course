import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'wrapFn' })
export class WrapFn implements PipeTransform {
  transform<TArgs extends unknown[], TResult>(
    func: (...args: TArgs) => TResult,
    ...args: TArgs): TResult {
    return func(...args);
  }
}
