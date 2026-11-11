import {Component} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';

type RegisterDTO = {
  contacts: {
    email: string;
    name: string;
  };
  workshop: 'pottery' | 'watercolor' | 'printmaking';
  termsAccepted: boolean;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [FormsModule],
})
export class AppComponent {
  protected submitted = false;

  registration: RegisterDTO | null = null;

  model = {
    contacts: {
      email: '',
      name: '',
    },
    workshop: '',
    termsAccepted: false,
  }

  protected submit(form: NgForm): void {
    this.submitted = true;
    this.registration = form.value;
  }
}
