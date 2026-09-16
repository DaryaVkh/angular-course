---
name: rxjs-angular
description: Correct RxJS usage inside Angular — HttpClient as cold Observable, Router and Reactive Forms streams, higher-order mapping for navigation/search/submit, AsyncPipe vs takeUntilDestroyed, shareReplay caching, signals interop (toSignal), and testing streams with TestScheduler and fakeAsync. Use when writing or reviewing Angular code that involves Observables, subscriptions, HttpClient, Router params, valueChanges, or async templates.
license: MIT
metadata:
  sources:
    - https://github.com/angular/skills (official Angular team skills, MIT)
    - https://github.com/jeffallan/claude-skills (angular-architect, MIT)
    - https://rxjs.dev/guide
version: '1.0.0'
---

# RxJS in Angular

## Where Observables live in Angular

| Group | Sources |
|-------|---------|
| HTTP + Router | `HttpClient`, `paramMap`, `queryParams`, router `events` |
| Forms + DOM | `valueChanges`, `statusChanges`, `fromEvent` |
| Realtime + Time | WebSocket, `interval`, custom `Subject`s |

## HttpClient is a cold Observable

- **No request is sent until subscription.** Multiple subscriptions = multiple requests.
- Each HTTP Observable emits one value and completes — but composition and ownership still matter.
- Mutations (`post`, `put`, `delete`) must be subscribed to execute.
- Prefer `async` pipe or `toSignal` for component reads so cleanup is automatic.

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

## Router params → always-fresh data

Every navigation produces a new `paramMap` value. Use `switchMap` so a stale request can never overwrite a newer one:

```typescript
route.paramMap.pipe(
  switchMap(params => this.api.getBook(params.get('id')!))
).subscribe(book => this.book = book);
```

`mergeMap` here is a race condition: the old product's response may arrive last and overwrite the new one.

## Reactive Forms as a stream

`valueChanges` turns user input into an Observable. The canonical search chain:

```typescript
results$ = this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term)),
);
```

Meaning: pause → drop duplicates → cancel stale request → show current results. In the template: `results$ | async`.

## Higher-order mapping in real scenarios

| Scenario | Operator | Why |
|----------|----------|-----|
| Search-as-you-type | `switchMap` | Only the latest term matters |
| Product card navigation | `switchMap` | Old card data is irrelevant |
| Order submit | `exhaustMap` | Double click must not create two orders |
| Dashboard quotes | `forkJoin` | All requests needed, parallel |
| Filters + URL query | `combineLatest` → `switchMap` | One consistent request from two live sources |
| Screen states (loading/data/error) | `startWith` → `map` → `catchError` | Explicit tri-state instead of a boolean |

Filters + URL pattern:

```typescript
combineLatest([
  this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)),
  this.route.queryParams,
]).pipe(
  switchMap(([filters, params]) =>
    this.http.get('/api/data', { params: { ...filters, ...params } })),
).subscribe(data => this.data = data);
```

Screen-state pattern:

```typescript
load$.pipe(
  switchMap(() => this.api.getProfile().pipe(
    map(p => ({ status: 'data', p }) as ScreenState),
    catchError(e => of({ status: 'error', e }) as Observable<ScreenState>),
    startWith({ status: 'loading' } as ScreenState),
  )),
).subscribe(state => this.state = state);
```

Error recovery on a request:

```typescript
this.http.get('/api/profile').pipe(
  retry({ count: 2, delay: 1000 }),
  catchError(() => of(null)),
  finalize(() => this.loading = false),
).subscribe(profile => this.profile = profile);
```

## Subscription cleanup — who owns the subscription

Every imperative `.subscribe()` has an owner, and the owner must stop it.

| Approach | When |
|----------|------|
| `async` pipe | Value needed only in the template — subscribe/unsubscribe automatic |
| `takeUntilDestroyed()` | Imperative subscribe in a component; auto-cancels on destroy |
| `takeUntil(destroy$)` | Legacy pattern for pre-16 Angular |

### `takeUntilDestroyed` and injection context

- **Without arguments** — only valid in an injection context: field initializer or constructor.
- **With `DestroyRef`** — required in `ngOnInit` and other regular methods:

```typescript
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.player.track$.pipe(
    takeUntilDestroyed(this.destroyRef),
  ).subscribe(render);
}
```

The short API does not remove the need to know who owns the subscription.

## Caching with shareReplay

```typescript
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly config$ = this.http.get('/api/config').pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getConfig() { return this.config$; }
}
```

- Without it: N subscribers = N HTTP requests.
- `refCount: true` disconnects from the source when subscribers drop to zero.
- `shareReplay` is not an eternal cache — decide refCount, reset and owner up front.

## Signals interop

Modern Angular is signals-first; RxJS remains for events and streams. Bridge both directions:

```typescript
// Observable → signal (auto-unsubscribes on destroy)
users = toSignal(this.api.getUsers(), { initialValue: [] });

// signal → Observable
value$ = toObservable(this.searchTerm);
```

- For pure component state prefer `signal`/`computed`.
- Keep RxJS where streams shine: debouncing, cancellation, combining async sources.
- `httpResource` can replace read-only HttpClient + subscription patterns with signal-based resources; keep `HttpClient` for mutations.

## Testing RxJS in Angular

### TestScheduler — marble testing

Virtual time: `debounceTime(300)` does not actually wait.

```typescript
import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const scheduler = new TestScheduler((actual, expected) =>
  expect(actual).toEqual(expected));

scheduler.run(({ cold, expectObservable }) => {
  // '-a-b|' : pause, value a, pause, value b, complete
  const result$ = cold('-a-b|').pipe(map(v => v.toUpperCase()));
  expectObservable(result$).toBe('-A-B|');
});
```

Verify order, timing and completion — not just the final array.

### Component tests

- Use mock services returning `of(...)` — never real HTTP.
- For time-based logic in components use `fakeAsync` + `tick` (Jest/Karma setups) or async mocks (Vitest zoneless setups).

## MUST / MUST NOT

**MUST:**
- Use `switchMap` for search/navigation; `exhaustMap` for submit.
- Clean up every imperative subscription (`takeUntilDestroyed`, `async` pipe).
- Return an Observable from `catchError`.
- Use `combineLatest` for live sources, `forkJoin` for completing tasks.
- Prefer `async` pipe or `toSignal` over manual subscribe in components.

**MUST NOT:**
- Nested `.subscribe()` calls — flatten with higher-order operators.
- `mergeMap` where responses must not race (search, navigation).
- Manual subscription lists instead of declarative teardown.
- `subscribe` in a service for data a template could consume via `async`/`toSignal`.
- Forget that `HttpClient` is cold — a shared stream without `shareReplay` re-sends per subscriber.
