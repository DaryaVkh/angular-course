import { Component } from '@angular/core';
import { UtilityFnPipe } from './utility-fn-pipe';

@Component({
  selector: 'app-root',
  template: `
    @for (activity of activities; track activity.name) {
      {{ activity.name }} :
      @for (person of persons;
        track person.name;
        let index = $index;
        let isFirst = $first) {
        {{ 'showName' | utilityFn: person.name : index }}
        {{ 'isAllowed' | utilityFn: person.age : isFirst : activity.minimumAge }}
      }
    }
  `,
  imports: [UtilityFnPipe],
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
}
