import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { BookingService } from '../booking.service';
import { inject } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { catchError } from 'rxjs/operators';

export function emailAvailable(): AsyncValidatorFn {
  const bookingService = inject(BookingService);

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null)

    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => bookingService.isEmailAvailable(email).pipe(
        map(isAvailable => isAvailable ? null : { emailTaken: true }),
        catchError(() => of(null))
        )
      )
    );
  };
}
