import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { LocalDBService, TopicType } from './localDB.service';

@Injectable({ providedIn: 'root' })
export class AppService {
  private dbService = inject(LocalDBService);

  getAllInfo = this.dbService.infos;

  deleteOldTopics(type: TopicType): Observable<boolean> {
    const deleteStreams = this.dbService
      .searchByType(type)
      .map((info) => this.dbService.deleteOneTopic(info.id));

    return deleteStreams.length === 0
      ? of(true)
      : forkJoin(deleteStreams).pipe(
        map((results) => results.every((res) => res)),
      );
  }
}
