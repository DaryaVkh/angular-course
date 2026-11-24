import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TopicType } from './topic.service';

export interface TopicDialogData {
  topics: TopicType[];
}

@Component({
  template: `
    <h1 mat-dialog-title>Темы интересов</h1>
    <div mat-dialog-content>
      @if (!data.topics?.length) {
        <p class="empty-hint">
          Список пуст! Диалог открылся раньше, чем завершился HTTP-запрос.
        </p>
      }
      <ul class="topic-list">
        @for (topic of data.topics; track $index) {
          <li class="topic-item">
            {{ topic }}
          </li>
        }
      </ul>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
  styles: [
    `
      .empty-hint {
        padding: 12px;
        border-radius: 8px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        font-size: 14px;
        margin: 0 0 8px;
      }
      .topic-list {
        list-style: none;
        padding: 0;
        margin: 8px 0 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .topic-item {
        padding: 10px 14px;
        border-radius: 8px;
        background: #eef2ff;
        color: #312e81;
        font-weight: 600;
      }
    `,
  ],
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicModalComponent {
  data = inject<TopicDialogData>(MAT_DIALOG_DATA);
}
