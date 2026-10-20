import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'heavyComputation',
})
export class HeavyComputationPipe implements PipeTransform {
  transform(name: string, index: number): string {
    return `${name} - ${index}`;
  }
}

@Component({
  selector: 'app-root',
  imports: [HeavyComputationPipe],
  template: `
    @for (person of persons; track person) {
      {{ person | heavyComputation: $index }}
    }
  `,
})
export class AppComponent {
  persons = ['toto', 'jack'];
}
