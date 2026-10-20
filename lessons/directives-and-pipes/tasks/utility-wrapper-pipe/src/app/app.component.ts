import { Component, Pipe, PipeTransform } from '@angular/core';
import { PersonUtils } from './person.utils';

type Utils = typeof PersonUtils;

@Pipe({
  name: 'personUtils',
})
export class PersonUtilsPipe implements PipeTransform {
  transform<K extends keyof Utils>(
    fnName: K,
    ...args: Parameters<Utils[K]>
  ): ReturnType<Utils[K]> {
    const fn = PersonUtils[fnName] as (
      ...args: unknown[]
    ) => ReturnType<Utils[K]>;
    return fn(...args);
  }
}

@Component({
  selector: 'app-root',
  imports: [PersonUtilsPipe],
  template: `
    @for (activity of activities; track activity.name) {
      {{ activity.name }} :
      @for (
        person of persons;
        track person.name;
        let index = $index;
        let isFirst = $first
      ) {
        {{ 'showName' | personUtils: person.name : index }}
        {{
          'isAllowed' | personUtils: person.age : isFirst : activity.minimumAge
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
}
