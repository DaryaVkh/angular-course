import { Component, forwardRef, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating-control',
  templateUrl: 'rating-control.component.html',
  styleUrls: ['rating-control.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RatingControlComponent,),
    multi: true
  }],
})
export class RatingControlComponent implements ControlValueAccessor {
  value: number | null = null;
  disabled = false;
  onChange: (value: number | null) => void = () => { };
  onTouched: () => void = () => { };

  setRating(index: number): void {
    if (this.disabled) {
      return;
    }

    this.value = index + 1;
    this.onChange(this.value);
    this.onTouched();
  }

  isStarActive(index: number): boolean {
    return this.value ? index < this.value : false;
  }

  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
