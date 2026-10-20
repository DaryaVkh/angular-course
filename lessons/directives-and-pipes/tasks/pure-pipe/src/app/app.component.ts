import { Component } from '@angular/core';
import { HeavyComputationPipe } from './heavy-computation.pipe';

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
