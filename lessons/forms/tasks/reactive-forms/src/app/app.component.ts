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
import { finalize, tap } from 'rxjs';
import { BookingReceipt, BookingService, Tour } from './booking.service';
import { emailAvailable } from './validators/email.available';
import { placesAvailable } from './validators/places.avialable';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private tours: Tour[] = [];

  form = this.formBuilder.group({
    contact: this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: this.formBuilder.control('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailAvailable()],
        updateOn: 'blur'
      }),
    }),
    guests: this.formBuilder.array<FormControl<string>>([]),
    tour: this.formBuilder.control('', [Validators.required]),
  }, {
    validators: placesAvailable((tourId) => this.getAvailableSeats(tourId)),
  });

  get name() {
    return this.form.controls.contact.controls.name;
  }
  get email() {
    return this.form.controls.contact.controls.email;
  }

  get guests() {
    return this.form.controls.guests;
  }

  addGuest() {
    this.guests.push(this.formBuilder.control('', [Validators.required, Validators.minLength(2)]));
  }

  get tour() {
    return this.form.controls.tour;
  }

  removeGuest(id: number) {
    this.guests.removeAt(id);
  }


  protected tours$ = this.bookingService.getTours().pipe(
    tap((tours) => {
      this.tours = tours;
      this.form.updateValueAndValidity();
    }),
  );

  protected get availableSeats(): number | undefined {
    return this.getAvailableSeats(this.form.controls.tour.value);
  }

  private getAvailableSeats(tourId: string): number | undefined {
    return this.tours.find((tour) => tour.id === tourId)?.seats;
  }

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  protected submit(): void {
    if (this.form.invalid || this.form.pending || this.saving()) {
      return;
    }

    const { contact, tour, guests } = this.form.getRawValue();
    this.errorMessage = '';
    this.saving.set(true);

    this.bookingService.book({ contact, tourId: tour, guests }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: (receipt) => {
        this.receipt = receipt;
        this.guests.clear();
        this.form.reset();
        this.tours$ = this.loadTours();
      },
      error: (error: unknown) => {
        this.errorMessage = error instanceof Error
          ? error.message
          : 'Не удалось забронировать экскурсию.';
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
