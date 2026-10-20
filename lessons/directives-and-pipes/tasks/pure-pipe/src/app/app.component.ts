import { Component } from '@angular/core';
import { NameWithIndexPipe } from './pipes/name-with-index-pipe';

@Component({
  selector: 'app-root',
  imports: [NameWithIndexPipe],
  template: `
    @for (person of persons; track person; let i = $index) {
      {{ person | nameWithIndex: i }}
    }
  `,
})
export class AppComponent {
  persons = ['toto', 'jack'];
}
