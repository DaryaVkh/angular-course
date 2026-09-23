import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FakeHttpService } from '../../data-access/fake-http.service';
import { StudentStore } from '../../data-access/student.store';
import { CardType } from '../../model/card.model';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-student-card',
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.scss',
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCardComponent implements OnInit {
  private http = inject(FakeHttpService);
  private store = inject(StudentStore);
  private destroyRef = inject(DestroyRef);

  students = this.store.students;
  cardType = CardType.STUDENT;

  ngOnInit(): void {
    this.http.fetchStudents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.store.addAll(s));
  }
}
