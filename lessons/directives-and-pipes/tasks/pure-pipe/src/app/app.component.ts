import { Component } from '@angular/core';
import { ComputationPipe } from '../pipe/computation-pipe';

@Component({
  selector: 'app-root',
  imports: [ComputationPipe],
  template: `
    @for (person of persons; track person) {
      {{ person | computation: $index }}
    }
  `,
})
export class AppComponent {
  persons = ['toto', 'jack'];
}
