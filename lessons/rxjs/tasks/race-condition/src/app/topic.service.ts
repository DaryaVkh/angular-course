import { Injectable, signal } from '@angular/core';
import { defer, finalize, map, timer } from 'rxjs';

export type TopicType = 'Politic' | 'Sport' | 'Culture' | 'Nature';

@Injectable({ providedIn: 'root' })
export class TopicService {
  readonly requestCount = signal(0);
  readonly isLoading = signal(false);

  fakeGetHttpTopic = () =>
    defer(() => {
      this.requestCount.update((count) => count + 1);
      this.isLoading.set(true);

      return timer(1000).pipe(
        map((): TopicType[] => ['Politic', 'Culture', 'Nature']),
        finalize(() => this.isLoading.set(false)),
      );
    });
}
