import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected submitted: {
    contact: {
      name: string;
      email: string;
    };
    workshop: string;
    termsAccepted: boolean;
  } | null = null;

  protected readonly workshopNames: Record<string, string> = {
    pottery: 'Керамика',
    watercolor: 'Акварель',
    printmaking: 'Линогравюра',
  };

  protected submit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.submitted = form.value;
  }

  protected clear(form: NgForm): void {
    form.resetForm({
      contact: {
        name: '',
        email: '',
      },
      workshop: '',
      termsAccepted: false,
    });
    this.submitted = null;
  }
}
