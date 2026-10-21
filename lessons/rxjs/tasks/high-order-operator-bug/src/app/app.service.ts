import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, take } from 'rxjs';
import { LocalDBService, TopicType } from './localDB.service';

@Injectable({ providedIn: 'root' })
export class AppService {
  private dbService = inject(LocalDBService);

  getAllInfo = this.dbService.infos;

  deleteOldTopics(type: TopicType): Observable<boolean> {
    const infoByType = this.dbService.searchByType(type);
    return infoByType.length > 0
      ? forkJoin(
          infoByType.map((t) => this.dbService.deleteOneTopic(t.id)),
        ).pipe(
          take(1),
          map((results) => results.reduce((prev, curr) => prev && curr, true)),
        )
      : of(true);
  }
}
