import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TopicType } from './topic.service';

export interface TopicDialogData {
  topics$: Observable<TopicType[]>;
}

@Component({
  template: `
    <h1 mat-dialog-title>Темы интересов</h1>
    <div mat-dialog-content>
      @if (topics(); as topics) {
        <ul class="topic-list">
          @for (topic of topics; track $index) {
            <li class="topic-item">
              {{ topic }}
            </li>
          }
        </ul>
      } @else {
        <div class="topic-list" data-testid="topics-skeleton">
          @for (item of skeletonItems; track $index) {
            <div class="topic-item skeleton-item"></div>
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
      .skeleton-item {
        height: 20px;
        background: #e2e8f0;
        animation: skeleton-pulse 1.2s ease-in-out infinite;
      }
      @keyframes skeleton-pulse {
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicModalComponent {
  data = inject<TopicDialogData>(MAT_DIALOG_DATA);
  topics = toSignal(this.data.topics$);
  readonly skeletonItems = [1, 2, 3];
}
