import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { shareReplay, take } from 'rxjs';
import { TopicModalComponent } from './topic-dialog.component';
import { TopicService, TopicType } from './topic.service';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="openTopicModal()">Open Topic</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'rxjs-race-condition';
  dialog = inject(MatDialog);
  topicService = inject(TopicService);
  topics: TopicType[] = [];

  readonly topics$ = this.topicService.fakeGetHttpTopic().pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  openTopicModal() {
    this.topics$.pipe(take(1)).subscribe((topics) => {
      this.dialog.open(TopicModalComponent, { data: { topics } });
    });
  }
}
