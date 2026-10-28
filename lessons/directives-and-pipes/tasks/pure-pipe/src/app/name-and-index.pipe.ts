import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameAndIndex',
})
export class NameAndIndexPipe implements PipeTransform {
  transform(name:string, index: number): string {
    return `${name} - ${index}`;
  }
}
