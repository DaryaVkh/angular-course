import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { TopicModalComponent } from './topic-dialog.component';
import { TopicService } from './topic.service';

describe('AppComponent (race-condition)', () => {
  let dialogOpenSpy: jest.Mock;

  beforeEach(async () => {
    dialogOpenSpy = jest.fn();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        TopicService,
        {
          provide: MatDialog,
          useValue: { open: dialogOpenSpy },
        },
      ],
    }).compileComponents();
  });

  it('Шаг 1: не должен открывать пустой диалог при раннем клике, а должен дождаться загрузки 3 тем', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Пользователь нажимает кнопку сразу (0 мс), не дожидаясь окончания таймера (1000 мс)
    component.openTopicModal();

    // Проходит 1000 мс — данные приходят от TopicService
    tick(1000);

    expect(dialogOpenSpy).toHaveBeenCalledWith(TopicModalComponent, {
      data: {
        topics: ['Politic', 'Culture', 'Nature'],
      },
    });
  }));

  it('Шаг 2: повторные открытия диалога не должны отправлять новые HTTP-запросы', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const topicService = TestBed.inject(TopicService);
    fixture.detectChanges();

    component.openTopicModal();
    tick(1000);

    // Открываем диалог второй и третий раз
    component.openTopicModal();
    component.openTopicModal();
    tick(1000);

    expect(dialogOpenSpy).toHaveBeenCalledTimes(3);
    expect(topicService.requestCount()).toBe(1);
  }));
});
