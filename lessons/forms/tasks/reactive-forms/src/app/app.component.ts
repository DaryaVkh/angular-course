import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize, tap } from 'rxjs';
import { BookingReceipt, BookingService, Tour } from './booking.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;

  protected tours$ = this.bookingService.getTours().pipe(
    tap(tours => {
      this.tours = tours;
    })
  );
  protected tours: Tour[] = [];

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  private validateSeats: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {

    const tourId = control.get('tour')?.value;
    const participants = control.get('participants')?.value ?? [];
    const requiredSeats = participants.length + 1;

    if (!tourId) {
      return null;
    }

    const selectedTour = this.tours.find(
      tour => String(tour.id) === String(tourId)
    );

    if (!selectedTour) {
      return null;
    }

    if (requiredSeats > selectedTour.seats) {
      return {
        notEnoughSeats: {
          required: requiredSeats,
          available: selectedTour.seats
        }
      };
    }

    return null;
  };

  form = this.formBuilder.group({
    contact: this.formBuilder.group({
      name: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [
        '',
        [Validators.required, Validators.email]
      ],
    }),
    participants: this.formBuilder.array<FormControl<string>>([]),
    tour: [
      '',
      [Validators.required,]
    ],
  }, {
    validators: this.validateSeats
  });

  protected submit(): void {
  }

  protected getSelectedTour() {
    const tourId = this.form.controls.tour.value;

    return this.tours.find(
      tour => String(tour.id) === String(tourId)
    );
  }

  get participants() {
    return this.form.controls.participants;
  }

  addParticipant() {
    this.participants.push(this.formBuilder.control('', [Validators.required, Validators.minLength(2)]));
  }

  removeParticipant(index: number) {
    this.participants.removeAt(index);
  }
}
