import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

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

  protected submitted: { name: string; workshop?: string } | null = null;

  protected submit(form: NgForm): void {
    const { contact, workshop } = form.value;

    this.submitted = {
      name: contact.name,
      workshop: this.workshops.find(({ id }) => id === workshop)?.title,
    };
  }

  protected reset(form: NgForm): void {
    form.resetForm();
    this.submitted = null;
  }
}
