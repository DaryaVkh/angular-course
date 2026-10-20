import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn',
})
export class WrapFnPipe implements PipeTransform {
  transform<T extends (...args: any[]) => any>(
    fn: T,
    ...args: Parameters<T>
  ): ReturnType<T> {
    return fn(...args);
  }
}
