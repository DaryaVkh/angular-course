import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AppService } from './app.service';
import { LocalDBService } from './localDB.service';

describe('AppService (high-order-operator-bug)', () => {
  let service: AppService;
  let dbService: LocalDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppService, LocalDBService],
    });

    service = TestBed.inject(AppService);
    dbService = TestBed.inject(LocalDBService);
    dbService.reset();
  });

  it('должен возвращать true, когда все записи категории успешно удалены (book, sport)', async () => {
    const bookResult = await firstValueFrom(service.deleteOldTopics('book'));
    expect(bookResult).toBe(true);
    expect(dbService.searchByType('book')).toHaveLength(0);

    const sportResult = await firstValueFrom(service.deleteOldTopics('sport'));
    expect(sportResult).toBe(true);
    expect(dbService.searchByType('sport')).toHaveLength(0);
  });

  it('должен возвращать false, если хотя бы одна запись в категории не удалилась (food: id=6)', async () => {
    const foodResult = await firstValueFrom(service.deleteOldTopics('food'));
    expect(foodResult).toBe(false);
    expect(dbService.searchByType('food')).toEqual([{ id: 6, topic: 'food' }]);
  });

  it('должен возвращать true, если записей выбранной категории больше нет', async () => {
    await firstValueFrom(service.deleteOldTopics('sport'));
    const secondCallResult = await firstValueFrom(
      service.deleteOldTopics('sport'),
    );
    expect(secondCallResult).toBe(true);
  });
});
