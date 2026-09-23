import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CityCardComponent } from './component/city-card/city-card.component';
import { StudentCardComponent } from './component/student-card/student-card.component';
import { TeacherCardComponent } from './component/teacher-card/teacher-card.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [TeacherCardComponent, StudentCardComponent, CityCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
