import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { StudentStore } from '../../data-access/student.store';
import { TeacherStore } from '../../data-access/teacher.store';
import { CardType } from '../../model/card.model';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  private teacherStore = inject(TeacherStore);
  private studentStore = inject(StudentStore);

  readonly id = input.required<number>();
  readonly name = input.required<string>();
  readonly type = input.required<CardType>();

  readonly delete = output<number>();
}
