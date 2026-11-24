import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { EventLogService } from '../../core/event-log.service';
import { TRANSPORT } from '../../core/transport';
import { FastNavigationComponent } from './fast-navigation.component';

describe('FastNavigationComponent', () => {
  let fixture: ComponentFixture<FastNavigationComponent>;
  let component: FastNavigationComponent;
  let item$: Subject<{ id: number; name: string; tag: string }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    item$ = new Subject();
    const fakeTransport = { getItem: jest.fn().mockReturnValue(item$) };

    await TestBed.configureTestingModule({
      imports: [FastNavigationComponent],
      providers: [{ provide: TRANSPORT, useValue: fakeTransport }, EventLogService],
    })
      .overrideComponent(FastNavigationComponent, { set: { template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(FastNavigationComponent);
    component = fixture.componentInstance;
  });

  it('switchMap оставляет только последний эмит', () => {
    component.reaId$.next(1);
    component.reaId$.next(2);
    component.reaId$.next(3);
    item$.next({ id: 3, name: 'C', tag: 'new' });
    expect(component.reaItem()?.id).toBe(3);
  });

  it('impGoTo отменяет предыдущую подписку при новом переходе', () => {
    const firstSubject = new Subject<{ id: number; name: string; tag: string }>();
    const secondSubject = new Subject<{ id: number; name: string; tag: string }>();

    const fakeTransport = TestBed.inject(TRANSPORT) as unknown as { getItem: jest.Mock };
    fakeTransport.getItem
      .mockReturnValueOnce(firstSubject)
      .mockReturnValueOnce(secondSubject);

    component.impGoTo(1);
    expect(firstSubject.observed).toBe(true);

    component.impGoTo(2);
    expect(firstSubject.observed).toBe(false); // отписан!
    expect(secondSubject.observed).toBe(true);

    secondSubject.next({ id: 2, name: 'Item 2', tag: 'hot' });
    expect(component.impItem()?.id).toBe(2);
  });
});
