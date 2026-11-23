import { isFormArray, ValidatorFn } from '@angular/forms';

export function placesAvailable(
  getAvailableSeats: (tourId: string) => number | undefined,
): ValidatorFn {
  return (form) => {
    const tourId = form.get('tour')?.value;
    const guests = form.get('guests');
    if (!tourId || !isFormArray(guests)) {
      return null;
    }

    const required = guests.length + 1;
    const available = getAvailableSeats(tourId);
    return available !== undefined && required > available
      ? { insufficientSeats: { required, available } }
      : null;
  };
}
