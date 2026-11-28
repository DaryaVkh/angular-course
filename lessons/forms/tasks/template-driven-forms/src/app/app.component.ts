import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface Application {
  contact: {
    name: string;
    email: string;
  };
  workshop: string;
  termsAccepted: boolean;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly workshops = [
    { id: 'pottery', title: 'Керамика' },
    { id: 'watercolor', title: 'Акварель' },
    { id: 'printmaking', title: 'Линогравюра' },
  ];

  protected model: Application = {
    contact: {
      name: '',
      email: '',
    },
    workshop: '',
    termsAccepted: false,
  };

  protected application: Application | null = null;

  protected submit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.application = form.value;
  }

  protected reset(form: NgForm): void {
    form.resetForm({
      contact: {
        name: '',
        email: '',
      },
      workshop: '',
      termsAccepted: false,
    });
    this.application = null;
  }

  protected workshopTitle(id: string): string {
    return this.workshops.find((workshop) => workshop.id === id)?.title ?? '';
  }
}
