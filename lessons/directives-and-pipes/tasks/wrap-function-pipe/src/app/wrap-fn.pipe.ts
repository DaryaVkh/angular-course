import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn'
})
export class WrapFnPipe implements PipeTransform {
  transform<Args extends unknown[], ResultValue>(
    callback: (...args: Args) => ResultValue, ...args: Args): ResultValue {
    return callback(...args);
  }
}
