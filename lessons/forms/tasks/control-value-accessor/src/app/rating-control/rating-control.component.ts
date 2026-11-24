import { Component, forwardRef } from '@angular/core';
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
  value: number | null = null;
  disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  setRating(index: number): void {
    if (this.disabled) return;

    this.value = index + 1;
    this.onChange(`${this.value}`);
    this.onTouched();
  }

  isStarActive(index: number, value: number | null): boolean {
    return value ? index < value : false;
  }

  writeValue(value: string | number | null): void {
    this.value = value !== null && value !== '' ? Number(value) : null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
