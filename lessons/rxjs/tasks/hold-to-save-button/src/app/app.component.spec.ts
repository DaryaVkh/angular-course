import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('HoldableDirective & AppComponent (hold-to-save-button)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  function dispatchHoldStart(btn: HTMLElement) {
    btn.dispatchEvent(new Event('pointerdown'));
    btn.dispatchEvent(new MouseEvent('mousedown'));
  }

  function dispatchHoldCancel(btn: HTMLElement) {
    btn.dispatchEvent(new Event('pointerup'));
    btn.dispatchEvent(new MouseEvent('mouseup'));
  }

  it('Шаг 1–2: при удержании кнопки прогресс изменяется, а при раннем отпускании сбрасывается в 0 без вызова onSend', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const sendSpy = jest.spyOn(component, 'onSend');
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    dispatchHoldStart(button);
    tick(500);

    expect(component.progress()).toBeGreaterThan(0);
    expect(component.progress()).toBeLessThan(100);
    expect(sendSpy).not.toHaveBeenCalled();

    // Отпускаем раньше 2000 мс
    dispatchHoldCancel(button);
    tick(100);

    expect(component.progress()).toBe(0);
    expect(sendSpy).not.toHaveBeenCalled();
  }));

  it('Шаг 3: при полном удержании (2000 мс) срабатывает holdTimeEnd -> onSend()', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const sendSpy = jest.spyOn(component, 'onSend');
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    dispatchHoldStart(button);
    tick(2100);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(component.savedCount()).toBe(1);

    dispatchHoldCancel(button);
  }));
});
