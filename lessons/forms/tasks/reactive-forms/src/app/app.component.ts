import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize, map } from 'rxjs';
import {
  BookingReceipt,
  BookingRequest,
  BookingService,
  Tour,
} from './booking.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styles: `
    .error {
      color: red;
    }

    .loading {
      color: grey;
    }

    .guest-input {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }

    .guest-input input {
      width: 100%;
    }
  `,
})
export class AppComponent {
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;

  protected tours$ = this.bookingService.getTours().pipe(takeUntilDestroyed());
  protected tours = signal<Tour[] | null>(null);

  protected readonly saving = signal<boolean>(false);
  protected errorMessage = '';
  protected receipt: BookingReceipt | null = null;

  get name() {
    return this.form.controls.contact.controls.name;
  }

  get email() {
    return this.form.controls.contact.controls.email;
  }

  get guests() {
    return this.form.controls.guests;
  }

  ngOnInit() {
    this.tours$.subscribe((tours) => this.tours.set(tours));
  }

  validateEmail: AsyncValidatorFn = (control) => {
    return this.bookingService.isEmailAvailable(control.value).pipe(
      takeUntilDestroyed(this.destroyRef),
      map((isValid) =>
        isValid ? null : { emailTaken: 'Данные email уже занят' },
      ),
    );
  };

  validateGuestsLength: ValidatorFn = () => {
    if (!this.form || !this.tour()) return null;

    return this.guests.length + 1 <= this.tour()!.seats
      ? null
      : { guestsLimit: 'Превышено количество гостей в туре' };
  };

  form = this.formBuilder.group(
    {
      contact: this.formBuilder.group({
        name: ['', Validators.required],
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [this.validateEmail],
            updateOn: 'blur',
          },
        ],
      }),
      tourId: ['', Validators.required],
      guests: this.formBuilder.array<string>([]),
    },
    { validators: [this.validateGuestsLength] },
  );

  tourId = toSignal(this.form.controls.tourId.valueChanges);

  tour = computed(() => {
    if (!this.form || !this.tours()) return null;

    const toursFiltered = this.tours()!.filter((t) => t.id === this.tourId());

    if (toursFiltered.length !== 1) return null;

    return toursFiltered[0];
  });

  protected submit(): void {
    if (this.form.invalid || this.form.pending) return;

    this.saving.set(true);
    this.receipt = null;
    this.errorMessage = '';

    const request = this.form.value as BookingRequest;
    console.log(request);

    this.bookingService
      .book(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.reset();
        },
        error: (error) => (this.errorMessage = error),
      });
  }

  reset(): void {
    this.form.reset();
    this.form.controls.guests.clear();
    this.tours.set(null);
    this.tours$.subscribe((tours) => this.tours.set(tours));
  }

  addGuest() {
    this.guests.push(
      this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(2),
      ]),
    );
  }

  removeGuest(index: number) {
    this.guests.removeAt(index);
  }
}
