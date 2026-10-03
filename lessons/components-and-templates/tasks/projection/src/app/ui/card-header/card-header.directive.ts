import { Directive } from "@angular/core";

// Директива для того, чтобы @ContentChild увидел произвольный селектор card-header
@Directive({
  selector: '[card-header]',
})
export class CardHeaderDirective {}