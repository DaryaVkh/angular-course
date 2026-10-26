import { Component } from '@angular/core';
import { TimerContainerComponent } from './timer-container.component';
import { INTERVAL } from './data';

@Component({
  selector: 'app-phone',
  imports: [TimerContainerComponent],
  providers: [
    { provide: INTERVAL, useValue: 2000 },
  ],
  template: `
    <div class="flex gap-2">
      Phone Call Timer:
      <p class="italic">(should be 2000s)</p>
    </div>
    <timer-container />
  `,
})
export default class PhoneComponent {}
