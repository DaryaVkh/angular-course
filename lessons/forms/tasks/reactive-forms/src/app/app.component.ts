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
  Validators,
} from '@angular/forms';
import { finalize, map, Observable, shareReplay, tap } from 'rxjs';
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

  private tours: Tour[] = [];
  protected tours$: Observable<Tour[]> = this.bookingService.getTours().pipe(
    tap((tours) => {
      this.tours = tours;
      this.form.updateValueAndValidity();
    }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  private readonly emailAvailabilityValidator: AsyncValidatorFn = (
    control: AbstractControl,
  ) => {
    const email = control.value as string;
    if (!email || control.hasError('required') || control.hasError('email')) {
      return Promise.resolve(null);
    }

    return this.bookingService.isEmailAvailable(email).pipe(
      map((available) => (available ? null : { emailTaken: true })),
    );
  };

  private readonly seatsValidator = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    if (!this.tours.length) {
      return null;
    }

    const tourId = control.get('tour')?.value as string;
    const tour = this.tours.find(({ id }) => id === tourId);
    if (!tour) {
      return null;
    }

    const participants = control.get('participants') as FormControl<string>[] | null;
    const participantCount = participants?.length ?? 0;
    const requiredSeats = participantCount + 1;

    return requiredSeats <= tour.seats ? null : { insufficientSeats: true };
  };

  protected readonly form = this.formBuilder.group(
    {
      contacts: this.formBuilder.group({
        name: this.formBuilder.control('', [Validators.required, Validators.minLength(2)]),
        email: this.formBuilder.control(
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [this.emailAvailabilityValidator],
            updateOn: 'blur',
          },
        ),
      }),
      participants: this.formBuilder.array<FormControl<string>>([]),
      tour: this.formBuilder.control('', [Validators.required]),
    },
    {
      validators: [this.seatsValidator],
    },
  );

  get name() {
    return this.form.controls.contacts.controls.name;
  }

  get participants() {
    return this.form.controls.participants;
  }

  get email() {
    return this.form.controls.contacts.controls.email;
  }

  get tour() {
    return this.form.controls.tour;
  }

  protected get selectedTour(): Tour | undefined {
    return this.tours.find(({ id }) => id === this.tour.value);
  }

  protected get requiredSeats(): number {
    return this.participants.length + 1;
  }

  addParticipant(): void {
    this.participants.push(
      this.formBuilder.control('', [Validators.required, Validators.minLength(2)]),
    );
  }

  removeParticipant(index: number): void {
    this.participants.removeAt(index);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.form.pending || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage = '';

    this.bookingService.book({
      contact: {
        name: value.contacts.name,
        email: value.contacts.email,
      },
      tourId: value.tour,
      guests: value.participants,
    }).pipe(
      finalize(() => this.saving.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (receipt) => {
        this.receipt = receipt;
        this.errorMessage = '';
        this.participants.clear();
        this.form.reset({
          contacts: { name: '', email: '' },
          participants: [],
          tour: '',
        });
        this.refreshTours();
      },
      error: (error: unknown) => {
        this.errorMessage =
          error instanceof Error ? error.message : 'Не удалось сохранить бронь.';
      },
    });
  }

  private refreshTours(): void {
    this.tours$ = this.bookingService.getTours().pipe(
      tap((tours) => {
        this.tours = tours;
        this.form.updateValueAndValidity();
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }
}
