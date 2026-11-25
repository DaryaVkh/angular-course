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
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, map, tap } from 'rxjs';
import { BookingReceipt, BookingService, Tour } from './booking.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          asyncValidators: (control) =>
            this.bookingService.isEmailAvailable(control.value).pipe(
              map((available) => (available ? null : { emailTaken: true })),
            ),
          updateOn: 'blur',
        }),
      }),
      tourId: ['', Validators.required],
      guests: this.formBuilder.array<FormControl<string>>([]),
    },
    {
      validators: (control) => {
        const { tourId, guests } = control.value;
        const tour = this.tours.find((tour) => tour.id === tourId);

        return tour && guests.length + 1 > tour.seats
          ? { insufficientSeats: true }
          : null;
      },
    },
  );

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  protected get availableSeats(): number {
    return (
      this.tours.find((tour) => tour.id === this.form.controls.tourId.value)
        ?.seats ?? 0
    );
  }

  protected addGuest(): void {
    this.form.controls.guests.push(
      this.formBuilder.control('', [Validators.required, Validators.minLength(2)]),
    );
  }

  protected removeGuest(index: number): void {
    this.form.controls.guests.removeAt(index);
  }

  protected submit(): void {
    if (this.form.invalid || this.form.pending || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage = '';

    this.bookingService
      .book(this.form.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.form.controls.guests.clear();
          this.form.reset();
          this.tours$ = this.loadTours();
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        },
      });
  }

  private loadTours() {
    return this.bookingService.getTours().pipe(
      tap((tours) => {
        this.tours = tours;
        this.form.updateValueAndValidity();
      }),
    );
  }
}
