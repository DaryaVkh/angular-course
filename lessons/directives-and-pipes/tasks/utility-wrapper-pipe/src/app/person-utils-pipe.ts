import { Pipe, PipeTransform } from '@angular/core';
import {PersonUtils} from "./person.utils";

type PersonUtilsFns = typeof PersonUtils;
type PersonUtilsFnName = keyof PersonUtilsFns;

@Pipe({
  name: 'personUtils'
})
export class PersonUtilsPipe implements PipeTransform {

  transform<TName extends PersonUtilsFnName>(fnName: TName, ...args: Parameters<PersonUtilsFns[TName]>): ReturnType<PersonUtilsFns[TName]> {
    const fn = PersonUtils[fnName] as (...args: unknown[]) => unknown;
    return fn(...args) as ReturnType<PersonUtilsFns[TName]>;
  }

}
