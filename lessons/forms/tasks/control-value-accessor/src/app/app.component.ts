import { Component } from '@angular/core';
import { FeedbackFormComponent, FeedbackType } from './feedback-form/feedback-form.component';

@Component({
  imports: [FeedbackFormComponent],
  selector: 'app-root',
  template: `
    <app-feedback-form (feedBackSubmit)="apiCall($event)"></app-feedback-form>
  `,
})
export class AppComponent {
  apiCall(event: FeedbackType): void {
    console.log(event);
  }
}
