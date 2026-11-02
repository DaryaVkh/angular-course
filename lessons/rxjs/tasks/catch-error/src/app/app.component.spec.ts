import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent (catch-error)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('должен продолжать обрабатывать новые запросы из submit$ после ошибки 404', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // 1. Успешный запрос posts
    component.input = 'posts';
    component.submit$.next();

    const req1 = httpMock.expectOne(
      'https://jsonplaceholder.typicode.com/posts/1',
    );
    req1.flush({ id: 1, title: 'Hello RxJS' });
    expect(component.response).toEqual({ id: 1, title: 'Hello RxJS' });

    // 2. Ошибочный запрос foo -> 404
    component.input = 'foo';
    component.submit$.next();

    const req2 = httpMock.expectOne(
      'https://jsonplaceholder.typicode.com/foo/1',
    );
    req2.flush('Not Found', { status: 404, statusText: 'Not Found' });

    // Внешний поток должен остаться активным!
    expect(component.streamStatus).toBe('alive');

    // 3. Повторный запрос comments после ошибки должен выполниться!
    component.input = 'comments';
    component.submit$.next();

    const req3 = httpMock.expectOne(
      'https://jsonplaceholder.typicode.com/comments/1',
    );
    req3.flush({ id: 1, body: 'Stream is still alive!' });

    expect(component.response).toEqual({
      id: 1,
      body: 'Stream is still alive!',
    });
  });
});
