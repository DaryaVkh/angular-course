import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wrapFn'
})
export class WrapFnPipe implements PipeTransform {

  transform<TIn extends Array<any>, TOut>(fn: (...args: TIn)=>TOut, ...args: TIn): TOut {
    return fn(...args);
  }

}
