import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapNameWithIndex',
})
export class MapNameWithIndex implements PipeTransform {
  transform(name: string, index: number) : string {
    return `${name} - ${index}`;
  }
}
