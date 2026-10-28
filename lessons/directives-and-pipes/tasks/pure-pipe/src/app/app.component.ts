import { Component } from '@angular/core';
import { NameAndIndexPipe } from './name-and-index.pipe';

@Component({
  selector: 'app-root',
  imports: [NameAndIndexPipe],
  template: `
    @for (person of persons; track person) {
      {{ person | nameAndIndex: $index }}
    }
  `,
})
export class AppComponent {
  persons = ['toto', 'jack'];
}
