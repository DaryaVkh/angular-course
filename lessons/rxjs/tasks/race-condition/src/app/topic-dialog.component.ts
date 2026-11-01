import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TopicType } from './topic.service';

export interface TopicDialogData {
  topics: TopicType[] | undefined;
}

@Component({
  template: `
    <h1 mat-dialog-title>Темы интересов</h1>
    <div mat-dialog-content>
      @if (data.topics; as topics) {
        <ul class="topic-list">
          @for (topic of topics; track $index) {
            <li class="topic-item">
              {{ topic }}
            </li>
          }
        </ul>
      } @else {
        <div class="topic-list" role="status" aria-label="Загрузка тем">
          @for (row of [1, 2, 3]; track row) {
            <div class="topic-skeleton" aria-hidden="true"></div>
          }
        </div>
      }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
  styles: [
    `
      .topic-skeleton {
        height: 40px;
        border-radius: 8px;
        background: #e2e8f0;
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
