import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn'
})
export class WrapFnPipe implements PipeTransform {

  transform(callback: (...args: any[]) => any, ...args: any): string {
    if (!callback) {
        return '';
    }
    return callback(...args);
  }
}
