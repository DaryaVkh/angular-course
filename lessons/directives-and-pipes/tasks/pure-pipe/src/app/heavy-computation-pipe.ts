import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'heavyComputation'
})
export class HeavyComputationPipe implements PipeTransform {

  transform(value: string, index: number): unknown {
    return `${value} - ${index}`;
  }

}
