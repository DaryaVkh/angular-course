import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule]
})
export class AppComponent {
  model = {email: '', name: '', password: '', termsAccepted: false, workshop: ''};
  protected submitted = false;

  protected application = {
    contact: { name: '', email: '' },
    workshop: '',
    termsAccepted: false,
  };

  protected readonly workshopTitles: Record<string, string> = {
    pottery: 'Керамика',
    watercolor: 'Акварель',
    printmaking: 'Линогравюра',
  };

  protected submit(form: NgForm): void {
    if (form.valid) {
      const {name, email, workshop, termsAccepted} = this.model;

      this.application = {
        contact: {name, email},
        workshop: workshop,
        termsAccepted: termsAccepted,
      };

      this.submitted = true;
    }
  }

  protected resetForm(form: NgForm): void {
    form.resetForm({
      contact: { name: '', email: '' },
      workshop: '',
      termsAccepted: false,
    });

    this.submitted = false;
  }
}
