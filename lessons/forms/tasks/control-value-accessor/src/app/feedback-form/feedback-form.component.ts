import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RatingControlComponent } from '../rating-control/rating-control.component';

@Component({
  imports: [RatingControlComponent, ReactiveFormsModule],
  selector: 'app-feedback-form',
  templateUrl: 'feedback-form.component.html',
  styleUrls: ['feedback-form.component.scss'],
})
export class FeedbackFormComponent {
  @Output()
  readonly feedBackSubmit: EventEmitter<Record<string, string | number | null>> =
    new EventEmitter<Record<string, string | number | null>>();

  readonly feedbackForm = new FormGroup({
    name: new FormControl('', {
      validators: Validators.required,
    }),
    email: new FormControl('', {
      validators: Validators.required,
    }),
    comment: new FormControl(),
    rating: new FormControl<number | null>(null, {
      validators: Validators.required,
    }),
  });

  submitForm(): void {
    this.feedBackSubmit.emit(this.feedbackForm.value);

    this.feedbackForm.reset();
  }
}
