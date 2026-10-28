import { Pipe, PipeTransform } from '@angular/core';
import { PersonUtils } from './person.utils';

type Utils = typeof PersonUtils;
type UtilCallback<FunctionName extends keyof Utils> = (
  ...args: Parameters<Utils[FunctionName]>) => ReturnType<Utils[FunctionName]>;

@Pipe({
  name: 'personUtils',
})
export class PersonUtilsPipe implements PipeTransform {
  transform<FuncName extends keyof Utils>(funcName: FuncName,
    ...args: Parameters<Utils[FuncName]>
  ): ReturnType<Utils[FuncName]> {
    const callback = PersonUtils[funcName] as unknown as UtilCallback<FuncName>;
    return callback(...args);
  }
}
