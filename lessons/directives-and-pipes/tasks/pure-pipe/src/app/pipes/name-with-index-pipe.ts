import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameWithIndex'
})
export class NameWithIndexPipe implements PipeTransform {

  transform(name: string, index: number): string {
    return `${name} - ${index}`;
  }
}
