import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize, map, Observable, tap } from 'rxjs';
import { BookingReceipt, BookingService, Tour } from './booking.service';

function seatsValidator(getTours: () => Tour[]): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const { tourId, guests } = form.value;
    const tour = getTours().find(({ id }) => id === tourId);

    if (tour && tour.seats < guests.length + 1) {
      return { notEnoughSeats: true };
    }

    return null;
  };
}

function emailAvailableValidator(): AsyncValidatorFn {
  const bookingService = inject(BookingService);

  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    bookingService
      .isEmailAvailable(control.value)
      .pipe(map((isAvailable) => (isAvailable ? null : { emailTaken: true })));
}

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

  private tours: Tour[] = [];

  protected tours$ = this.loadTours();

  protected readonly form = this.formBuilder.group(
    {
      contact: this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: this.formBuilder.control('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [emailAvailableValidator()],
          updateOn: 'blur',
        }),
      }),
      tourId: ['', Validators.required],
      guests: this.formBuilder.array<FormControl<string>>([]),
    },
    { validators: seatsValidator(() => this.tours) },
  );

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  protected get name() {
    return this.form.controls.contact.controls.name;
  }

  protected get email() {
    return this.form.controls.contact.controls.email;
  }

  protected get tourId() {
    return this.form.controls.tourId;
  }

  protected get guests() {
    return this.form.controls.guests;
  }

  protected get requiredSeats() {
    return this.guests.length + 1;
  }

  protected get availableSeats() {
    return this.tours.find(({ id }) => id === this.tourId.value)?.seats;
  }

  protected addGuest(): void {
    this.guests.push(
      this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(2),
      ]),
    );
  }

  protected removeGuest(index: number): void {
    this.guests.removeAt(index);
  }

  protected submit(): void {
    this.saving.set(true);
    this.errorMessage = '';

    this.bookingService
      .book(this.form.getRawValue())
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.form.reset();
          this.guests.clear();
          this.tours$ = this.loadTours();
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        },
      });
  }

  private loadTours(): Observable<Tour[]> {
    return this.bookingService
      .getTours()
      .pipe(tap((tours) => (this.tours = tours)));
  }
}
