import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { LocalDBService, TopicType } from './localDB.service';

@Injectable({ providedIn: 'root' })
export class AppService {
  private dbService = inject(LocalDBService);

  getAllInfo = this.dbService.infos;

  deleteOldTopics(type: TopicType): Observable<boolean> {
    const infoByType = this.dbService.searchByType(type);

    if (infoByType.length === 0) {
      return of(true);
    }

    const requests$ = infoByType.map((t) => this.dbService.deleteOneTopic(t.id));

    return forkJoin(requests$).pipe(
      map((results) => results.every(
        (result) => result === true
      )),
    );
  }
}
