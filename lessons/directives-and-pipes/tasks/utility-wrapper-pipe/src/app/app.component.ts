import { Component } from '@angular/core';
import { PersonUtils } from './person.utils';
import { UtilityPipe } from './utility.pipe';

@Component({
  selector: 'app-root',
  imports: [UtilityPipe],
  template: `
    @for (activity of activities; track activity.name) {
      {{ activity.name }} :
      @for (
        person of persons;
        track person.name;
        let index = $index;
        let isFirst = $first
      ) {
        {{ personUtils | utility: 'showName' : person.name : index }}
        {{
          personUtils
            | utility: 'isAllowed' : person.age : isFirst : activity.minimumAge
        }}
      }
    }
  `,
})
export class AppComponent {
  persons = [
    { name: 'Toto', age: 10 },
    { name: 'Jack', age: 15 },
    { name: 'John', age: 30 },
  ];

  activities = [
    { name: 'biking', minimumAge: 12 },
    { name: 'hiking', minimumAge: 25 },
    { name: 'dancing', minimumAge: 1 },
  ];

  personUtils = PersonUtils;
}
