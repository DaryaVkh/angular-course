import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface Registration {
  contact: { name: string; email: string };
  workshop: string;
  termsAccepted: boolean;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected registration: Registration | null = null;
  protected readonly workshopTitles: Record<string, string> = {
    pottery: 'Керамика',
    watercolor: 'Акварель',
    printmaking: 'Линогравюра',
  };

  protected submit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.registration = form.value;
  }

  protected reset(form: NgForm): void {
    form.resetForm({
      contact: { name: '', email: '' },
      workshop: '',
      termsAccepted: false,
    });
    this.registration = null;
  }
}
