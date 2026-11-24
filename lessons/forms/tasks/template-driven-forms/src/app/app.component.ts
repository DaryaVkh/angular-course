import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [FormsModule],
})
export class AppComponent {
  private getInitialModel() {
    return {
      contact: {
        name: '',
        email: '',
      },
      workshop: '',
      termsAccepted: false,
    }
  }

  model = this.getInitialModel();

  protected submitted = false;

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.submitted = true;
    }
  }

  onReset(form: NgForm) {
    this.submitted = false;
    form.resetForm(this.getInitialModel());
  }
}
