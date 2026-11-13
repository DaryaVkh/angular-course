import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RatingControlComponent } from '../rating-control/rating-control.component';

export type FeedbackType = {
  name: string | null;
  email: string | null;
  comment: string | null;
  rating: number | null;
}

@Component({
  imports: [RatingControlComponent, ReactiveFormsModule],
  selector: 'app-feedback-form',
  templateUrl: 'feedback-form.component.html',
  styleUrls: ['feedback-form.component.scss'],
})
export class FeedbackFormComponent {
  @Output()
  readonly feedBackSubmit: EventEmitter<FeedbackType> = new EventEmitter<FeedbackType>();

  readonly feedbackForm = new FormGroup({
    name: new FormControl('', {
      validators: Validators.required,
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    rating: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    comment: new FormControl<string | null>(null),
  });

  submitForm(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      console.error('Form is invalid')
      return;
    }

    this.feedBackSubmit.emit({
      name: this.feedbackForm.controls.name.value,
      email: this.feedbackForm.controls.email.value,
      rating: this.feedbackForm.controls.rating.value,
      comment: this.feedbackForm.controls.comment.value,
    });

    this.feedbackForm.reset();
  }
}
