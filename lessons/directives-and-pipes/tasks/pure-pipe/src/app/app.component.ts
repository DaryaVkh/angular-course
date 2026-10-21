import { Component } from '@angular/core';
import { MapNameWithIndex } from './map-name-with-index-pipe';

@Component({
  selector: 'app-root',
  imports: [MapNameWithIndex],
  template: `
    @for (person of persons; track person) {
      {{ person | mapNameWithIndex : $index }}
    }
  `,
})
export class AppComponent {
  persons = ['toto', 'jack'];
}
