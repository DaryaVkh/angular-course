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
import { finalize, map, Observable } from 'rxjs';
import { BookingReceipt, BookingService, Tour } from './booking.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;

  protected readonly tours = signal<Tour[]>([]);
  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  protected readonly guests = this.formBuilder.array<FormControl<string>>([]);
  protected readonly form = this.formBuilder.group(
    {
      contact: this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: this.formBuilder.control('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.emailAvailableValidator()],
          updateOn: 'blur',
        }),
      }),
      tourId: ['', Validators.required],
      guests: this.guests,
    },
    { validators: [this.seatsValidator()] },
  );

  constructor() {
    this.loadTours();
  }

  protected get name() {
    return this.form.controls.contact.controls.name;
  }

  protected get email() {
    return this.form.controls.contact.controls.email;
  }

  protected get tourId() {
    return this.form.controls.tourId;
  }

  protected get seatsNeeded(): number {
    return this.guests.length + 1;
  }

  protected get availableSeats(): number {
    return (
      this.tours().find((tour) => tour.id === this.tourId.value)?.seats ?? 0
    );
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
    if (this.form.invalid || this.form.pending) {
      return;
    }

    this.saving.set(true);
    this.errorMessage = '';

    this.bookingService
      .book({
        contact: this.form.controls.contact.getRawValue(),
        tourId: this.tourId.value,
        guests: this.guests.getRawValue(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.form.reset();
          this.guests.clear();
          this.loadTours();
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        },
      });
  }

  private loadTours(): void {
    this.bookingService
      .getTours()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tours) => this.tours.set(tours));
  }

  private emailAvailableValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
      this.bookingService
        .isEmailAvailable(control.value)
        .pipe(map((available) => (available ? null : { emailTaken: true })));
  }

  private seatsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tour = this.tours().find(
        ({ id }) => id === control.get('tourId')?.value,
      );

      if (!tour) {
        return null;
      }

      return tour.seats < this.guests.length + 1
        ? { notEnoughSeats: true }
        : null;
    };
  }
}
