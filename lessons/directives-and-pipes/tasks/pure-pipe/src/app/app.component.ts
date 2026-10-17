import { Component } from '@angular/core';
import { MapNameWithIndexPipePipe } from './map-name-with-index-pipe';

@Component({
  selector: 'app-root',
  imports: [MapNameWithIndexPipePipe],
  template: `
    @for (person of persons; track person) {
      {{ person | mapNameWithIndexPipe : $index }}
    }
  `,
})
export class AppComponent {
  persons = ['toto', 'jack'];
}
