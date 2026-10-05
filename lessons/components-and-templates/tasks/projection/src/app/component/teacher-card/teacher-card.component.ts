import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FakeHttpService,
  randTeacher,
} from '../../data-access/fake-http.service';
import { TeacherStore } from '../../data-access/teacher.store';
import { CardType } from '../../model/card.model';
import { CardComponent } from '../../ui/card/card.component';
import { NgOptimizedImage } from '@angular/common';
import { ListItem } from '../../model/list-item';

@Component({
  selector: 'app-teacher-card',
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.scss',
  imports: [CardComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherCardComponent implements OnInit {
  private http = inject(FakeHttpService);
  private store = inject(TeacherStore);
  private destroyRef = inject(DestroyRef);

  teachers = this.store.teachers;
  teacherItems = computed<ListItem[]>(() =>
    this.teachers().map((teacher) => ({ id: teacher.id, name: teacher.firstName })),
  );
  cardType = CardType.TEACHER;

  protected addTeacher() : void {
    this.store.addOne(randTeacher());
  }

  protected deleteTeacher(id: number) : void {
    this.store.deleteOne(id);
  }

  ngOnInit(): void {
    this.http.fetchTeachers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((t) => this.store.addAll(t));
  }
}
