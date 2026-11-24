import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import {
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { finalize, map, Observable, tap } from 'rxjs';
import { BookingReceipt, BookingService, Tour } from './booking.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private readonly seatsValidator: ValidatorFn = (group) => {
    const tour = this.tours.find((tour) => tour.id === group.get('tourId')?.value);
    const guests = group.get('guests') as FormArray<FormControl<string>>;
    return tour && guests.length + 1 > tour.seats
      ? { notEnoughSeats: true }
      : null;
  };

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly emailValidator: AsyncValidatorFn = (ctrl) =>
    this.bookingService.isEmailAvailable(ctrl.value).pipe(
      map((free) => free ? null : { emailTaken: true }),
      finalize(() => this.changeDetector.markForCheck()),
    );

  protected get email() {
    return this.form.controls.contact.controls.email;
  }

  protected readonly form = this.formBuilder.group({
    contact: this.formBuilder.group({
      name: ['', Validators.required],
      email: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.emailValidator],
        updateOn: 'blur',
      }),
    }),
    tourId: ['', Validators.required],
    guests: this.formBuilder.array<FormControl<string>>([]),
  }, {
    validators: [this.seatsValidator],
  });

  protected get guests(): FormArray<FormControl<string>> {
    return this.form.controls.guests;
  }

  protected addGuest(): void {
    this.guests.push(
      new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
        ],
      }),
    );
  }

  protected removeGuest(index: number): void {
    this.guests.removeAt(index);
  }

  private loadTours(): Observable<Tour[]> {
    return this.bookingService.getTours().pipe(
      tap((arg) => {
        this.tours = arg;
        this.form.updateValueAndValidity();
      }),
    );
  }

  protected get availableSeats(): number {
    return this.tours.find((tour) => tour.id === this.form.controls.tourId.value)?.seats ?? 0;
  }

  protected tours$ = this.loadTours();

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  protected submit(): void {
    if (this.form.invalid || this.form.pending || this.saving()) return;
    this.errorMessage = '';
    this.saving.set(true);

    this.bookingService.book(this.form.getRawValue()).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: (arg) => {
        this.receipt = arg;
        this.guests.clear();
        this.form.reset();
        this.tours$ = this.loadTours();
      },
      error: (err: unknown) => {
        this.errorMessage = err instanceof Error
          ? err.message
          : 'Не удалось оформить бронь, попробуйте снова.';
      },
    });
  }
}
