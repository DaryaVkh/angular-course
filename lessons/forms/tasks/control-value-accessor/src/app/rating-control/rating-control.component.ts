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
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(f: (value: number | null) => void): void {
    this.onChange = f;
  }

  registerOnTouched(f: () => void): void {
    this.onTouched = f;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setRating(index: number): void {
    if (this.disabled) {
      return;
    }

    this.value = index + 1;
    this.onChange(this.value);
    this.onTouched();
  }

  isStarActive(index: number, value: number | null): boolean {
    return value ? index < value : false;
  }
}
