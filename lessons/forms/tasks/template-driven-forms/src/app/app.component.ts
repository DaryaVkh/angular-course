import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected submitted = false;

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
  }
}
