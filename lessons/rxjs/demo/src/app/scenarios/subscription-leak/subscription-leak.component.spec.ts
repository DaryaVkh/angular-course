import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventLogService } from '../../core/event-log.service';
import { SubscriptionLeakComponent } from './subscription-leak.component';

describe('SubscriptionLeakComponent', () => {
  let fixture: ComponentFixture<SubscriptionLeakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionLeakComponent],
      providers: [EventLogService],
    })
      .overrideComponent(SubscriptionLeakComponent, { set: { template: '<div></div>' } })
      .compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('создаётся без ошибок', () => {
    fixture = TestBed.createComponent(SubscriptionLeakComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('после destroy императивный виджет копит зомби-тики, реактивный останавливается', fakeAsync(() => {
    fixture = TestBed.createComponent(SubscriptionLeakComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.impCreate();
    component.reaCreate();
    tick(1000);

    const reactiveTicksBeforeDestroy = component.reaTicks();
    expect(component.impTicks()).toBeGreaterThan(0);
    expect(reactiveTicksBeforeDestroy).toBeGreaterThan(0);

    component.impDestroy();
    component.reaDestroy();
    tick(1000);

    expect(component.impZombieTicks()).toBeGreaterThan(0);
    expect(component.reaTicks()).toBe(reactiveTicksBeforeDestroy);
  }));
});