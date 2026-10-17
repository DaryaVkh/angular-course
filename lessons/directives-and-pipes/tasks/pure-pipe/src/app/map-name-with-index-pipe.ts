import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapNameWithIndexPipe',
})
export class MapNameWithIndexPipePipe implements PipeTransform {
  transform(name: string, index: number) : string {
    return `${name} - ${index}`;
  }
}
