import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {

  protected workshops = [
    { value: '', label: 'Выберите занятие' },
    { value: 'pottery', label: 'Керамика' },
    { value: 'watercolor', label: 'Акварель' },
    { value: 'printmaking', label: 'Линогравюра' },
  ];

  protected user = {
    contact: {
      name: '',
      email: '',
    },
    workshop: '',
    termsAccepted: false
  };

  protected submitted = false;

  protected submit(form: NgForm): void {
    console.log(form.value);
    this.submitted = true;
  }

  protected selectedWorkshopLabel(): string {
    return this.workshops.find(
      w => w.value === this.user.workshop
    )?.label ?? '';
  }

  protected resetForm(form: NgForm): void {
    form.resetForm({
      contact: {
        name: '',
        email: '',
      },
      workshop: '',
      termsAccepted: false
    });

    this.submitted = false;
  }
}
