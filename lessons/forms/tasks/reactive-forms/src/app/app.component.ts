import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, Component,
  DestroyRef, inject, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl, AsyncValidatorFn, FormBuilder,
  FormControl, ReactiveFormsModule, ValidationErrors,
  ValidatorFn, Validators
} from '@angular/forms';
import {
  catchError, finalize, map, Observable,
  of, shareReplay, startWith,
  Subject, switchMap, tap
} from 'rxjs';
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


  private readonly toursReload$ = new Subject<void>();

  protected tours$ = this.toursReload$.pipe(
    startWith<void>(undefined),
    switchMap(() => this.bookingService.getTours().pipe(
      takeUntilDestroyed(this.destroyRef)
    )),
    tap(tours => {
      this.tours = tours;
      this.form.updateValueAndValidity();
    }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  private reloadTours(): void {
    this.toursReload$.next();
  }
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

  private validateEmailAsync(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.bookingService.isEmailAvailable(control.value).pipe(
        map(isAvailable => {
          return isAvailable ? null : { emailTaken: true };
        }),
        catchError(() => of(null))
      );
    };
  }

  form = this.formBuilder.group({
    contact: this.formBuilder.group({
      name: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.validateEmailAsync()],
          updateOn: 'blur',
        },],
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
    if (this.form.invalid || this.form.pending || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage = '';
    this.receipt = null;

    const formValue = this.form.getRawValue();

    const request = {
      contact: {
        name: formValue.contact.name.trim(),
        email: formValue.contact.email.trim()
      },
      tourId: formValue.tour,
      guests: formValue.participants.map(name => name.trim())
    };

    this.bookingService.book(request).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.saving.set(false);
      })
    ).subscribe({
      next: receipt => {
        this.receipt = receipt;

        this.participantsControl.clear();
        this.form.reset();

        this.reloadTours();
      },

      error: error => {
        this.errorMessage = error instanceof Error
          ? error.message
          : 'Не удалось оформить бронирование. Попробуйте ещё раз';
      }
    });
  }

  protected getSelectedTour() {
    const tourId = this.form.controls.tour.value;

    return this.tours.find(
      tour => String(tour.id) === String(tourId)
    );
  }

  get participantsControl() {
    return this.form.controls.participants;
  }

  addParticipant() {
    this.participantsControl
      .push(this.formBuilder.control(
        '',
        [Validators.required, Validators.minLength(2)]
      ));
  }

  removeParticipant(index: number) {
    this.participantsControl.removeAt(index);
  }

  get nameControl() {
    return this.form.controls.contact.controls.name;
  }

  get emailControl() {
    return this.form.controls.contact.controls.email;
  }
}
