import { NgIf, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { randStudent, randTeacher } from '../../data-access/fake-http.service';
import { StudentStore } from '../../data-access/student.store';
import { TeacherStore } from '../../data-access/teacher.store';
import { CardType } from '../../model/card.model';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [ListItemComponent, NgOptimizedImage, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  private teacherStore = inject(TeacherStore);
  private studentStore = inject(StudentStore);

  readonly list = input<any[] | null>(null);
  readonly type = input.required<CardType>();
  readonly customClass = input('');

  CardType = CardType;

  addNewItem() {
    const type = this.type();
    if (type === CardType.TEACHER) {
      this.teacherStore.addOne(randTeacher());
    } else if (type === CardType.STUDENT) {
      this.studentStore.addOne(randStudent());
    }
  }
}
