---
name: rxjs-fundamentals
description: Core RxJS knowledge for writing correct reactive code — Observable contract, creation operators, pipe, essential operators, higher-order mapping strategies, combining streams, error handling, Subjects and subscription lifecycle. Use when writing or reviewing any RxJS code, choosing operators, or debugging streams, regardless of framework.
license: MIT
metadata:
  sources:
    - https://rxjs.dev (official documentation)
    - https://github.com/jeffallan/claude-skills (angular-architect, references/rxjs.md, MIT)
    - https://github.com/majiayu000/claude-skill-registry (rxjs-patterns)
version: '1.0.0'
---

# RxJS Fundamentals

## The Observable contract

A stream emits **zero or more `next` values**, then at most one terminal event: `error` or `complete`.

```
next* → (error | complete)?
```

- After `error` or `complete` no further values arrive — ever.
- `error` and `complete` are mutually exclusive.
- Design every stream with this contract in mind: does it complete (HTTP) or is it long-lived (events, WebSocket)?

## Execution model

- Declaring an Observable runs nothing — like declaring a function.
- **Each `subscribe()` is a new execution.** Two subscriptions to one cold Observable run its body twice.
- `from(promise)` observes a task that already started; the subscription does not make the Promise lazy. Use `defer(() => from(...))` when the work must start at subscribe time.

## Creation operators

| Operator | Behaviour | Use when |
|----------|-----------|----------|
| `of(a, b, c)` | Emits arguments as-is, then completes | Test values, fallback value in `catchError` |
| `from(iterable/promise)` | Flattens collection into separate `next`s; Promise → one `next` + `complete` | Arrays, iterables, Promises, thenables |
| `of([1,2,3])` vs `from([1,2,3])` | `of` emits the array as ONE value; `from` emits 1, 2, 3 | Know the difference — a classic bug source |
| `defer(() => factory)` | Calls the factory on every subscribe | Lazy creation, fresh state per subscription |
| `throwError(() => err)` | Stream that errors immediately | Re-throwing after logging in `catchError` |
| `interval(ms)` / `timer(ms)` | Time-based streams | Always bound with `take(n)` / `takeUntil` — they never complete on their own |

## Essential transformation operators

```typescript
source$.pipe(
  filter(x => x > 2),        // pass-through decision, does not change values
  map(x => x * 10),          // pure transformation, does not change count
  tap(v => log(v)),          // side effects only — never transform with tap
  startWith(initial),        // first value the subscriber sees
  distinctUntilChanged(),    // drops consecutive duplicates (needs comparator for objects)
  debounceTime(300),         // emit last value after silence — "wait until typing stops"
  take(3),                   // completes after N values, releases the subscription
)
```

- **Order matters.** `filter → map` and `map → filter` produce different streams.
- `debounceTime` + `distinctUntilChanged` is the canonical "user stopped typing" prefix.
- For object streams use `distinctUntilChanged((a, b) => a.id === b.id)` or `distinctUntilKeyChanged`.

## Higher-order mapping — the four strategies

When a value of an outer stream triggers an inner Observable (e.g. HTTP request), the operator choice is a **product decision about concurrency**:

| Operator | Strategy | Mnemonic | Best for | Danger |
|----------|----------|----------|----------|--------|
| `switchMap` | Cancel previous | «забудь прошлое, работай с актуальным» | Search-as-you-type, navigation, latest-wins | Cancelling an important POST |
| `mergeMap` | Run all in parallel | «запусти всё; результаты приходят по готовности» | Independent loads, logs, background work | Out-of-order responses in search |
| `concatMap` | Queue sequentially | «сохрани порядок и ничего не потеряй» | Ordered saves, command queues | Long queues from rapid input |
| `exhaustMap` | Ignore while busy | «занят — новые команды не принимаю» | Submit, login, double-click protection | Lost user input |

**Selection algorithm:**
1. New work makes the old irrelevant? → `switchMap`
2. Order doesn't matter, parallelism wanted? → `mergeMap`
3. Strict order, nothing lost? → `concatMap`
4. Ignore repeats while busy? → `exhaustMap`

## Combining streams

| Operator | Semantics | Completes when |
|----------|-----------|----------------|
| `combineLatest([a$, b$])` | Emits latest of each on ANY source change; waits until every source emitted at least once | When all sources complete |
| `forkJoin([a$, b$])` | Waits for ALL sources to complete, emits last values once (like `Promise.all`) | Immediately after all complete |
| `merge(a$, b$)` | Flattens everything into one stream | When all sources complete |

- **Live values** (form state + query params) → `combineLatest`.
- **Finishing tasks** (a group of HTTP calls) → `forkJoin`.
- A never-completing source inside `forkJoin` means the result never arrives.

## Error handling

```typescript
http$.pipe(
  retry({ count: 2, delay: 1000 }),          // resubscribe on error
  catchError(err => of(fallback)),           // replace error with a value — stream continues
  // or re-throw after logging:
  // catchError(err => { log(err); return throwError(() => err); }),
  finalize(() => this.loading = false),      // runs on next/error/complete/unsubscribe
)
```

- `catchError` MUST return an Observable — returning a bare value is a type error.
- `retry` resubscribes the source; for HTTP this re-sends the request.
- `throwError(() => err)` (factory form) preserves stack trace timing.

## Subjects

| Type | Behaviour | Use for |
|------|-----------|---------|
| `Subject` | Multicast, no memory; late subscribers miss past events | Event buses, `takeUntil` notifiers |
| `BehaviorSubject` | Stores last value, emits it to new subscribers immediately | Current-state streams |
| `ReplaySubject(n)` | Replays last N values | Activity feeds |

A Subject is both Observable and Observer — it can sit inside `pipe` chains. For pure component state in modern Angular prefer signals; Subjects remain the bridge for events and `takeUntil`.

## Subscription lifecycle

A subscription is a **resource**: its lifetime must not outlive its owner.

- `unsubscribe()` stops the subscription; whether the underlying work is cancelled depends on the source (HTTP — yes; `setInterval`-based — teardown runs).
- `interval(1000).subscribe(...)` without teardown runs forever, even after the component is destroyed.
- Prefer declarative cleanup (`takeUntil`, `take(n)`, framework pipes) over manual subscription lists.

## Quick reference

| Need | Operator |
|------|----------|
| Pause after input | `debounceTime` |
| Drop consecutive duplicates | `distinctUntilChanged` |
| Cancel stale request | `switchMap` |
| Protect submit | `exhaustMap` |
| Strict order | `concatMap` |
| Parallel requests | `mergeMap` |
| Wait for all | `forkJoin` |
| React to any change | `combineLatest` |
| Initial state | `startWith` |
| Bounded timer | `interval` + `take` |
| Error recovery | `catchError`, `retry` |
| Share/cache result | `shareReplay({ bufferSize: 1, refCount: true })` |
