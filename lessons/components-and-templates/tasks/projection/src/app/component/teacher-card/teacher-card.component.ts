import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FakeHttpService } from '../../data-access/fake-http.service';
import { TeacherStore } from '../../data-access/teacher.store';
import { CardType } from '../../model/card.model';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-teacher-card',
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.scss',
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherCardComponent implements OnInit {
  private http = inject(FakeHttpService);
  private store = inject(TeacherStore);
  private destroyRef = inject(DestroyRef);

  teachers = this.store.teachers;
  cardType = CardType.TEACHER;

  ngOnInit(): void {
    this.http.fetchTeachers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((t) => this.store.addAll(t));
  }
}
