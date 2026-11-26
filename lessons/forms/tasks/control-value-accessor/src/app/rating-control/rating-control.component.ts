import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating-control',
  templateUrl: 'rating-control.component.html',
  styleUrls: ['rating-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingControlComponent),
      multi: true,
    },
  ],
})
export class RatingControlComponent implements ControlValueAccessor {
  protected rating = signal<number>(0);
  protected disabled = signal<boolean>(false);

  protected onChange: { (_: any): {} } = () => ({});
  protected onTouched: { (): void } = () => {};

  writeValue(value: number | null) {
    this.rating.set(value ?? 0);
  }

  registerOnChange(fn: { (_: any): {} }) {
    this.onChange = fn;
  }

  registerOnTouched(fn: { (): void }) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }

  setRating(index: number): void {
    if (this.disabled()) return;
    this.rating.set(index + 1);
    this.onChange(this.rating());
    this.onTouched();
  }

  isStarActive(index: number, value: number | null): boolean {
    return value ? index < value : false;
  }
}
