# RxJS — Реактивное программирование для фронтенд-разработчиков

> От идеи потока до выбора оператора в реальном UI

**Источники содержания:**
- Курс RxJS: [rxjs-course-avy.web.app/lessons](https://rxjs-course-avy.web.app/lessons)
- Официальная документация: [rxjs.dev](https://rxjs.dev/)
- Практический контекст: [angular-challenges.vercel.app](https://angular-challenges.vercel.app/)

---

# Раздел 1. Добро пожаловать в RX

Идея реактивности и разница подходов

---

## Интерфейс — это значения во времени

Экран меняется сам: пользователь печатает, сервер отвечает, таймеры тикают.

```
clicks:   --1--2--3--------|
input:    --r-rx-rxjs------|
HTTP:     ------data-------|
timer:    --0--1--2--3-----|
```

Источники разные, природа одна: каждое событие — значение в последовательности.

> Запомни: интерфейс — это не статичная картинка, а поток значений во времени.

---

## Почему привычных инструментов недостаточно

Каждый инструмент решает свою задачу. Современный экран — это много событий и состояний одновременно.

| Инструмент | Проблема |
|------------|----------|
| Callbacks | Логика распадается на вложенные функции: отменить нельзя, собрать события в одну цепочку — тоже |
| Promise | Даёт один результат и не отменяется. А поиск или фильтр — это много результатов на каждое изменение |
| Event listeners | Каждый обработчик живёт сам по себе: добавление, удаление и связи между событиями — всё вручную |

Callback, Promise и слушатели работают по отдельности. Интерфейсу нужно связывать события между собой.

> Запомни: Promise — одно значение. UI — много значений во времени.

---

## Что такое RxJS

Библиотека, которая работает с событиями как с массивами — только значения приходят со временем.

| | Поведение |
|---|-----------|
| Массив: значения уже есть | Все элементы лежат в памяти. Методы `map` и `filter` обрабатывают их сразу, за один проход |
| Поток: значения приходят | Значения появляются одно за другим. Те же `map` и `filter` — но срабатывают на каждое новое значение |

**Пример: поиск книг.** Пользователь печатает → ждём паузу 300 мс → один запрос к API → список книг на экране.

> Запомни: RxJS — это `map` и `filter` для событий, которые происходят во времени.

Источники: [RxJS Overview](https://rxjs.dev/guide/overview), [RxJS Course Lesson 1](https://rxjs-course-avy.web.app/lessons)

---

## Promise и Observable: в чём разница

Оба получают результат асинхронно. Разница — сколько результатов и когда начинается работа.

| | Promise — одна посылка | Observable — радиоэфир |
|---|------------------------|------------------------|
| Количество значений | один запрос — один ответ | значений может быть сколько угодно |
| Запуск | начинает работать сразу после создания | начинает работать при подписке |
| Результат | ответ приходит один раз и навсегда | новые значения приходят сами |
| Отмена | остановить выполнение нельзя | подписку можно остановить в любой момент |

Promise: «жду посылку». Observable: «слушаю радио» — включил и получаю, выключил — тишина.

> Запомни: подписка запускает cold Observable, но не делает ленивым уже созданный Promise. Для отложенного создания Promise используй `defer(() => from(...))`.

---

## Где живёт Observable

В Angular поток уже встроен во многие повседневные API.

| Группа | Примеры |
|--------|---------|
| HTTP + Router | `HttpClient`, `paramMap`, `queryParams` |
| Forms + Events | `valueChanges`, `statusChanges`, `fromEvent` |
| Realtime + Time | WebSocket, `interval`, пользовательские `Subject` |

Один API помогает одинаково работать с разными асинхронными источниками.

> Запомни: Observable встречается в HttpClient, формах, роутере и событиях.

---

## Push и Pull

Кто решает, когда появится следующее значение?

```
PULL:  const value = getData();          // потребитель сам запрашивает значение
PUSH:  stream$.subscribe(render);       // источник отправляет значения, когда они появляются
```

Observable использует Push-модель: подписчик реагирует на новые уведомления.

> Запомни: Observable — это Push-модель: данные приходят сами, вы только подписываетесь.

---

# Раздел 2. Базовые элементы

Observable, Observer, Subscription и жизненный цикл

---

## Observable выполняется при подписке

Как с функцией: объявление ничего не запускает. Вызов для Observable — это `subscribe()`.

```
1. Объявление:  const stream$ = of(1, 2, 3);   — код не выполнялся
2. Вызов:       stream$.subscribe(console.log); — выполняется сейчас: 1, 2, 3
```

```typescript
import { of } from 'rxjs';

const stream$ = of(1, 2, 3);
// Ничего не происходит

stream$.subscribe(v => console.log(v));
// 1, 2, 3
```

- **Каждая подписка — новый вызов.** Две подписки к одному Observable выполнят инструкцию дважды — как два вызова одной функции.
- **Нюанс:** `from(promise)` наблюдает за задачей, которая уже идёт: Promise начал работу ещё до подписки.

> Запомни: работа стартует при подписке. Новая подписка — новый запуск.

---

## Жизненный цикл: next, error, complete

Контракт допускает много `next`, затем не более одного завершения.

| Метод | Описание |
|-------|----------|
| `next(value)` | Новое значение. Может произойти 0 или много раз. |
| `error(err)` | Аварийное завершение. После него значений нет. |
| `complete()` | Успешное завершение. После него значений нет. |

```typescript
stream$.subscribe({
  next:     v => console.log(v),
  error:    e => console.error(e),
  complete: () => console.log('done')
});
```

> Запомни: контракт: `next* → (error | complete)?` — после error или complete новых значений не будет.

---

## Subject и BehaviorSubject

Оба являются горячими источниками и Observer одновременно.

`Subject` отправляет события активным подписчикам:

```typescript
import { Subject } from 'rxjs';

const submit$ = new Subject<void>();
submit$.subscribe(() => console.log('submitted'));
submit$.next();
```

`BehaviorSubject` хранит последнее значение и сразу отдаёт его новому подписчику:

```typescript
import { BehaviorSubject } from 'rxjs';

const page$ = new BehaviorSubject(1);
page$.subscribe(page => console.log(page)); // 1
page$.next(2);
```

Subject — для событий. BehaviorSubject — когда новый подписчик должен сразу получить текущее значение. Для состояния в новых Angular-компонентах часто удобнее использовать `signal`, но Subject полезен как мост событий и для `takeUntil`.

---

## Subscription — это ресурс

Жизненный цикл подписки должен совпадать с жизненным циклом владельца.

```
component:  create ──────────────── destroy
stream:        1──2──3──4──×   ← подписка пережила компонент — утечка
```

```typescript
const sub = interval(1000).subscribe(render);
// ...позже...
sub.unsubscribe(); // остановить поток
```

- `unsubscribe()` прекращает подписку; будет ли отменена сама операция — зависит от источника.
- **Предпочтительно в Angular:** AsyncPipe или `takeUntilDestroyed()` связывают подписку с компонентом.

> Запомни: `interval(1000)` без отписки будет работать вечно — даже после уничтожения компонента.

---

## Итоги раздела

Базовые вопросы, на которые мы теперь умеем отвечать — попробуйте ответить сами:

- Когда Observable начинает работу — при создании или при подписке?
- Что происходит с потоком после `error` или `complete`?
- Чем `BehaviorSubject` отличается от `Subject`?
- Кто и когда должен вызывать `unsubscribe()`?

Затрудняетесь с ответом — самое время перечитать раздел, прежде чем идти дальше.

---

# Раздел 3. Операторы создания

Как превратить значения, массивы, Promise и время в поток

---

## of()

Создаёт поток из готовых аргументов. Каждое значение — `next`, затем `complete`.

```
input:   --(1)--(2)--(3)--|
         ↓ of(1, 2, 3)
output:  --(1)--(2)--(3)--|
```

```typescript
import { of } from 'rxjs';

of(10, 20, 30).subscribe({
  next: v => console.log(v),
  complete: () => console.log('done')
});
// 10, 20, 30, done
```

Когда использовать: тестовые значения, начальные данные, замена ошибки значением в `catchError`.

> Запомни: `of` сохраняет структуру каждого аргумента.

---

## from()

Разворачивает iterable или связывает Promise с Observable — по одному значению за раз.

```
input:   --('a')--('b')--('c')--|
         ↓ from(['a','b','c'])
output:  --('a')--('b')--('c')--|
```

```typescript
import { from } from 'rxjs';

from(['a', 'b', 'c']).subscribe(v => log(v));
// 'a', 'b', 'c' — по одному

from(fetch('/api/data')).subscribe(res => log(res));
// Promise → Observable
```

Когда использовать: массивы, iterable, Promise и сторонние асинхронные API.

> Запомни: `from` превращает элементы коллекции в отдельные `next`. `of` передаёт массив целиком.

---

## of([1,2,3]) vs from([1,2,3])

Одинаковый массив, разная форма потока.

| | of([1, 2, 3]) | from([1, 2, 3]) |
|---|---|---|
| Поток | `--([1,2,3])--\|` | `--(1)--(2)--(3)--\|` |
| Поведение | `next([1,2,3])` → `complete()` | `next(1)` → `next(2)` → `next(3)` → `complete()` |

```typescript
of([1, 2, 3]).subscribe(v => console.log(v));
// [1, 2, 3]  ← одно значение-массив

from([1, 2, 3]).subscribe(v => console.log(v));
// 1, 2, 3  ← три значения
```

> Запомни: `of` передаёт массив целиком. `from` разворачивает его элементы.

---

## from(promise)

Результат Promise становится одним `next`, затем `complete`. Ошибка Promise → `error`.

```
Promise:     ----(resolved)----|
             ↓ from()
Observable:  ----(resolved)----|
```

```typescript
import { from } from 'rxjs';

from(fetch('/api/users')).subscribe({
  next: res => log(res),
  error: err => log(err)
});
```

- **Нюанс запуска:** Promise уже начал работу до вызова `from()`. Подписка не делает его ленивым.
- Нужен запуск при подписке? Об этом — следующий оператор: `defer()`.

> Запомни: resolve → `next + complete`. reject → `error`.

---

## defer()

Фабрика вызывается заново при каждой подписке.

```
subscribe #1 → factory 1
subscribe #2 → factory 2
```

```typescript
import { defer, of } from 'rxjs';

let n = 0;
const request$ = defer(() => of(++n));

request$.subscribe(v => log(v)); // 1
request$.subscribe(v => log(v)); // 2 — фабрика вызвана снова
```

Используйте `defer`, когда параметры или сама операция должны вычисляться в момент `subscribe`.

> Запомни: `of(1)` — одно значение для всех. `defer` — новый Observable на каждый subscribe.

---

## throwError()

Создаёт поток, который сразу завершается ошибкой.

```
input:   --(start)
output:  --× (error)
```

```typescript
import { throwError } from 'rxjs';

throwError(() => new Error('Boom')).subscribe({
  error: e => console.log(e.message) // 'Boom'
});
```

Когда использовать: повторный выброс ошибки из `catchError` после логирования.

> Запомни: `throwError` передаёт ошибку дальше; `of(...)` в `catchError` заменяет её значением.

---

## interval() + take()

Бесконечный таймер становится ограниченным потоком.

```
input:   --(0)--(1)--(2)--(3)--(4)--...
         ↓ take(3)
output:  --(0)--(1)--(2)--|
```

```typescript
import { interval, take } from 'rxjs';

interval(1000)           // 0, 1, 2, 3, ... бесконечно
  .pipe(take(3))         // взять только 3
  .subscribe(v => log(v));
// 0, 1, 2, complete
```

> Запомни: `take(N)` завершает поток после N значений и освобождает подписку.

---

## Итоги раздела

Базовые вопросы, на которые мы теперь умеем отвечать — попробуйте ответить сами:

- Чем `of([1, 2, 3])` отличается от `from([1, 2, 3])`?
- Что сделает `from(promise)`, если промис завершился ошибкой?
- Сколько раз `defer()` вызывает фабрику — и когда именно?
- Как остановить бесконечный `interval()`?

Затрудняетесь с ответом — самое время перечитать раздел, прежде чем идти дальше.

---

# Раздел 4. Pipe и операторы

Трансформация, фильтрация и побочные эффекты

---

## pipe()

Читаемый конвейер: каждый оператор получает выход предыдущего.

```
source$ → [filter] → [map] → result$
```

```typescript
source$.pipe(
  filter(x => x > 2),
  map(x => x * 10)
).subscribe(result);
```

Порядок операторов важен: меняется не только код, но и смысл потока.

> Запомни: операторы в `pipe` выполняются последовательно: вывод `op1` → вход `op2`.

---

## map()

Преобразует каждое значение без изменения количества событий.

```
input:   --(1)--(2)--(3)--|
         ↓ map(x => x * 10)
output:  --(10)--(20)--(30)--|
```

```typescript
import { of, map } from 'rxjs';

of(1, 2, 3).pipe(
  map(x => x * 10)
).subscribe(v => log(v));
// 10, 20, 30
```

Когда использовать: преобразование API-модели во ViewModel.

> Запомни: `map` — чистая трансформация: вход → выход.

---

## filter()

Пропускает только значения, удовлетворяющие условию.

```
input:   --(1)--(2)--(3)--(4)--(5)--|
         ↓ filter(x => x > 2)
output:  ------(3)--(4)--(5)------|
```

```typescript
import { of, filter } from 'rxjs';

of(1, 2, 3, 4, 5).pipe(
  filter(x => x > 2)
).subscribe(v => log(v));
// 3, 4, 5
```

Когда использовать: отбрасывание невалидных или неинтересных событий.

> Запомни: `filter` не меняет значение, а решает, пропустить ли его.

---

## map + filter

Операторы комбинируются, а порядок определяет результат.

```
input:     --(1)--(2)--(3)--(4)--(5)--|
           ↓ filter(x => x > 2)
filtered:  ------(3)--(4)--(5)--------|
           ↓ map(x => x * 10)
output:    ------(30)--(40)--(50)----|
```

```typescript
of(1, 2, 3, 4, 5).pipe(
  filter(x => x > 2),
  map(x => x * 10)
).subscribe(v => log(v));
// 30, 40, 50
```

> Запомни: `filter → map` и `map → filter` могут давать разные результаты.

---

## tap()

Выполняет побочное действие и не меняет значение.

```
input:   --(1)--(2)--(3)--|
         ↓ tap(v => log(v))
output:  --(1)--(2)--(3)--|   (значения не изменились, но лог сработал)
```

```typescript
of(1, 2, 3).pipe(
  tap(v => console.log('got:', v)),
  map(v => v * 10)
).subscribe();
```

Когда использовать: логи, диагностика и внешние эффекты без трансформации.

> Запомни: если нужно изменить значение, используйте `map`, а не `tap`.

---

## startWith()

Добавляет начальное значение перед событиями источника.

```
input:   --------('Loaded')----|
         ↓ startWith('Loading')
output:  ('Loading')--('Loaded')----|
```

```typescript
import { of, startWith } from 'rxjs';

of('Loaded').pipe(
  startWith('Loading')
).subscribe(state => log(state));
// 'Loading', 'Loaded'
```

Когда использовать: начальное UI-состояние до первого ответа.

> Запомни: `startWith` определяет первое значение, которое увидит подписчик.

---

## distinctUntilChanged()

Удаляет только последовательные дубликаты.

```
input:   --(a)--(a)--(b)--(b)--(a)--|
         ↓ distinctUntilChanged()
output:  --(a)------(b)------(a)--|
```

```typescript
import { from, distinctUntilChanged } from 'rxjs';

from(['a', 'a', 'b', 'b', 'a']).pipe(
  distinctUntilChanged()
).subscribe(v => log(v));
// 'a', 'b', 'a' — без дублей подряд
```

Когда использовать: не запускать логику повторно, если значение не изменилось.

Для объектов задайте comparator или сравнивайте ключ:

```typescript
results$.pipe(
  distinctUntilChanged((previous, current) => previous.id === current.id)
);
```

> Запомни: `distinctUntilChanged` сравнивает с предыдущим значением. Для объектов нужен явный компаратор или `distinctUntilKeyChanged`.

---

## debounceTime()

Выдаёт последнее значение после паузы во входном потоке.

```
input:   (r)-(rx)-(rxjs)--------------------|
         ↓ debounceTime(300)
output:  ----------------(rxjs)------------|
```

```typescript
import { fromEvent, debounceTime, distinctUntilChanged, map } from 'rxjs';

fromEvent<InputEvent>(input, 'input').pipe(
  map(event => (event.target as HTMLInputElement).value),
  debounceTime(300),
  distinctUntilChanged(),
).subscribe(term => search(term));
// запрос только после паузы 300мс
```

Что происходит: таймер перезапускается на каждом новом событии. Выходит только последнее значение после тишины.

> Запомни: `debounceTime` = «подожди, пока пользователь перестанет печатать».

---

## Итоги раздела

Базовые вопросы, на которые мы теперь умеем отвечать — попробуйте ответить сами:

- Почему порядок операторов в `pipe()` важен?
- Чем `tap()` отличается от `map()`?
- Какое первое значение увидит подписчик после `startWith()`?
- Какую проблему решает `debounceTime()`?

Затрудняетесь с ответом — самое время перечитать раздел, прежде чем идти дальше.

---

# Раздел 5. Higher-order mapping

Четыре стратегии для конкурирующих внутренних потоков

---

## Событие запускает новый Observable

Значение внешнего потока может создавать HTTP-запрос.

```
valueChanges → term → HTTP Observable → results
```

Higher-order operator управляет подписками на внутренние Observable.

> Запомни: значение потока может быть другим Observable — например, HTTP-запросом.

---

## Что делать, если событий несколько?

Новый запрос начинается, пока предыдущий ещё выполняется.

```
события:   (a)----(b)----(c)----------|
           ↓ каждое запускает запрос
запросы:   HTTP a  HTTP b  HTTP c
```

Четыре стратегии: **отменить**, **параллелить**, **поставить в очередь**, **игнорировать новое**.

Выбор оператора — это решение о конкуренции, порядке и потере событий.

> Запомни: switchMap — отменить старый. mergeMap — запустить параллельно. concatMap — в очередь. exhaustMap — игнорировать.

---

## switchMap — отменить прошлое

Новый input переключает подписку на новый внутренний поток.

```
events:   --(a)----(b)----(c)----------|
inner a:  --(a1)--(a2) ✕               |   ← отменён при 'b'
inner b:           --(b1)--(b2) ✕       |   ← отменён при 'c'
inner c:                    --(c1)--(c2)|
output:                     --(c1)--(c2)|
                              (✕ = отмена, | = complete)
```

| | |
|---|---|
| Лучше всего | Поиск по мере ввода, навигация, устаревающие запросы |
| Опасно | Сохранение данных: новый input может отменить важный POST |

```typescript
searchControl.valueChanges.pipe(
  debounceTime(300),
  switchMap(term => http.get('/api/search?q=' + term))
).subscribe(results => show(results));
```

> Запомни: `switchMap` = «забудь прошлое, работай с актуальным».

---

## mergeMap — выполнять параллельно

Все внутренние потоки активны одновременно.

```
events:   --(a)----(b)----(c)----------|
inner a:  --(a1)--(a2)--(a3)|          |
inner b:           --(b1)--(b2)|        |
inner c:                    --(c1)--(c2)|
output:    --(a1)--(b1)--(a3)--(b2)--(c1)--(c2)|
```

| | |
|---|---|
| Лучше всего | Независимые загрузки, логи, фоновые действия |
| Опасно | Для поиска ответы могут прийти не в том порядке |

```typescript
from([1, 2, 3]).pipe(
  mergeMap(id => http.get(`/api/item/${id}`))
).subscribe(item => log(item));
```

> Запомни: `mergeMap` = «запусти всё; результаты приходят по готовности».

---

## concatMap — поставить в очередь

Следующая работа ждёт завершения предыдущей.

```
events:   --(a)-(b)-(c)----------------|
inner a:  --(a1)-----(a2)|              |
inner b:                --(b1)--(b2)|    |
inner c:                          --(c1)--(c2)|
output:   --(a2)--------(b2)--------(c2)|
```

| | |
|---|---|
| Лучше всего | Последовательные сохранения, команды с важным порядком |
| Опасно | Быстрый input создаёт длинную очередь и задержку |

```typescript
saveActions$.pipe(
  concatMap(action => http.post('/api/save', action))
).subscribe(res => log(res));
```

> Запомни: `concatMap` = «сохрани порядок и ничего не потеряй».

---

## exhaustMap — игнорировать новое

Пока внутренний поток активен, новые события отбрасываются.

```
events:   --(a)--(b)--------(c)--------|     (b игнорируется — занят)
inner a:  --(a1)-----(a2)|              |
inner b:  (игнорирован)                 |
inner c:                       --(c1)--(c2)|
output:   --(a1)-----(a2)-----(c1)--(c2)|
```

| | |
|---|---|
| Лучше всего | Submit, login, защита от двойного клика |
| Опасно | Пользовательский input может потеряться без ответа |

```typescript
submitClicks$.pipe(
  exhaustMap(() => http.post('/api/save', formData))
).subscribe(res => log(res));
```

> Запомни: `exhaustMap` = «занят — новые команды не принимаю».

---

## Четыре стратегии на одном экране

Оператор выбирается по продуктовой семантике, а не по привычке.

| Оператор | Стратегия | Главный приоритет |
|----------|-----------|-------------------|
| switchMap | Отменяет прошлое | Актуальность |
| mergeMap | Параллелит всё | Скорость |
| concatMap | Сохраняет очередь | Порядок |
| exhaustMap | Игнорирует новое | Защита |

Сначала сформулируйте, что делать с конкурирующей работой. Затем выбирайте оператор.

> Запомни: `switchMap` отменяет. `mergeMap` параллелит. `concatMap` ждёт. `exhaustMap` игнорирует.

---

## Алгоритм выбора higher-order оператора

Четыре вопроса приводят к одному из четырёх решений:

1. **Новая работа делает прошлую неактуальной?** → `switchMap`
2. **Порядок не важен, можно параллельно?** → `mergeMap`
3. **Нужно выполнить всё строго по очереди?** → `concatMap`
4. **Повторы нужно игнорировать, пока заняты?** → `exhaustMap`

> Запомни: сначала выберите поведение при конкуренции. Код оператора станет очевидным.

---

## Итоги раздела

Базовые вопросы, на которые мы теперь умеем отвечать — попробуйте ответить сами:

- Какой оператор отменяет предыдущий запрос — и когда это опасно?
- Почему `exhaustMap` защищает кнопку «Оформить»?
- Когда `concatMap` лучше `mergeMap`?
- Чем опасен `mergeMap` для поиска?

Затрудняетесь с ответом — самое время перечитать раздел, прежде чем идти дальше.

---

# Раздел 6. Комбинирование и жизненный цикл

Связать несколько источников и управлять ресурсами

---

## combineLatest()

Выдаёт последние значения при изменении любого источника.

```
a$:       --(1)--------(2)-----------|
b$:       -----(x)---------(y)-------|
          ↓ combineLatest
result:   -----([1,x])--([2,x])--([2,y])--|
```

```typescript
import { combineLatest } from 'rxjs';

combineLatest([
  this.filterForm.valueChanges,
  this.route.queryParams
]).subscribe(([filters, params]) =>
  this.loadData(filters, params)
);
```

Результата нет, пока каждый источник не отправит хотя бы одно значение.

> Запомни: `combineLatest` эмитит при любом изменении источника, если все уже отправили хотя бы раз.

---

## forkJoin()

Ждёт `complete` всех источников, затем выдаёт последние значения.

```
httpA$:    -----(a)----|
httpB$:    ----------(b)----|
          ↓ forkJoin
result:   --------------([a,b])----|
```

```typescript
import { forkJoin } from 'rxjs';

forkJoin({
  users: this.http.get('/api/users'),
  roles: this.http.get('/api/roles')
}).subscribe(({ users, roles }) =>
  this.init(users, roles)
);
```

Бесконечный источник не завершится — `forkJoin` не выдаст результат.

> Запомни: `forkJoin` ждёт complete всех источников. Если источник бесконечный — результата не будет.

---

## combineLatest vs forkJoin

Выбор зависит от жизненного цикла источников.

| | combineLatest | forkJoin |
|---|---------------|----------|
| Тип потоков | Живые потоки | Завершающиеся потоки |
| Результатов | Много | Один итоговый |
| Реакция | На любое изменение | Ждёт complete всех |
| Ожидание | Ждёт первый next каждого | Подходит для группы HTTP |

Живые значения → `combineLatest`. Завершающиеся задачи → `forkJoin`.

> Запомни: `combineLatest` — для живых потоков. `forkJoin` — для завершающихся (HTTP).

---

## takeUntil()

Завершает поток при первом значении управляющего Observable.

```
input:    --(1)--(2)--(3)--(4)--(5)--|
          ↓
          takeUntil(destroy$)
          ↓
output:   --(1)--(2)--(3)--|   (завершается при сигнале destroy$)
```

```typescript
import { Subject, takeUntil } from 'rxjs';

private destroy$ = new Subject<void>();

ngOnInit() {
  this.api.getData().pipe(
    takeUntil(this.destroy$)
  ).subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

В Angular 16+ предпочитайте `takeUntilDestroyed()`.

> Запомни: `takeUntil(notifier$)` завершает поток при первом значении `notifier$`.

---

## shareReplay()

Одна подписка на источник, последнее значение доступно новым потребителям.

| | Поведение |
|---|---|
| Без shareReplay | Каждый subscribe → новый HTTP-запрос. N подписчиков = N запросов. |
| С `shareReplay({ bufferSize: 1, ... })` | Один результат сохраняется и отдаётся новым подписчикам. |
| `refCount: true` | Источник отключается, когда подписчиков не осталось. Для завершившегося HTTP результат обычно остаётся в replay-кэше. |
| `refCount: false` | Источник продолжает работать без подписчиков. Для бесконечных потоков это может удерживать ресурсы. |

`shareReplay` не вечный кэш: заранее определите refCount, сброс и владельца live-источника.

```typescript
import { shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config$ = this.http.get('/api/config').pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getConfig() { return this.config$; }
}
```

> Запомни: `shareReplay(1)` — кэш последнего значения. `refCount: true` — отписка от источника, когда нет подписчиков.

---

## Итоги раздела

Базовые вопросы, на которые мы теперь умеем отвечать — попробуйте ответить сами:

- `combineLatest` или `forkJoin` — что выбрать для живых фильтров?
- Что будет с `forkJoin`, если один источник не завершится?
- Как `takeUntil` останавливает поток?
- Когда `shareReplay` экономит запросы?

Затрудняетесь с ответом — самое время перечитать раздел, прежде чем идти дальше.

---

# Раздел 7. RxJS в Angular

HttpClient, Router, Forms, шаблоны и жизненный цикл подписок

---

## HttpClient возвращает Observable

Один HTTP-вызов обычно выдаёт ответ и завершается.

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

Почему это удобно:

- отмена через `unsubscribe`;
- композиция с Router и Forms;
- единая обработка ошибок;
- повтор запроса: каждая новая подписка запускает HTTP-запрос заново.

HTTP Observable завершается сам, но композиция и владение подпиской всё равно важны.

> Запомни: `HttpClient.get()` — это Observable. Если нужен повтор — переподпишитесь.

---

## Router params → актуальные данные

Каждая навигация создаёт новое значение ID.

```
paramMap:  --(1)----(2)----(3)----|
           ↓ switchMap(id → HTTP)
HTTP:      --(user 1) ✕
                    --(user 2) ✕
                             --(user 3)|
```

```typescript
import { ActivatedRoute } from '@angular/router';

@Component({...})
export class UserDetailComponent {
  constructor(route: ActivatedRoute) {
    route.paramMap.pipe(
      switchMap(params => this.api.get(params.get('id')))
    ).subscribe(user => this.user = user);
  }
}
```

`switchMap` отменяет устаревший запрос при смене URL.

> Запомни: Router — источник событий. `params`, `queryParams`, `data` — всё Observable.

---

## Reactive Forms как поток

`valueChanges` превращает ввод пользователя в Observable.

```typescript
export class SearchComponent {
  search = new FormControl('');

  results$ = this.search.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.api.search(term))
  );
}
```

Смысл цепочки: пауза → убрать дубли → отменить старый запрос → показать актуальное.

В шаблоне: `results$ | async`.

Форма сообщает события; конвейер операторов превращает их в состояние экрана.

> Запомни: `valueChanges` — это Observable. `pipe()` превращает его в готовый поток данных.

---

## AsyncPipe управляет подпиской

Подписка создаётся при отрисовке шаблона и очищается при уничтожении компонента.

```
component:  users$ →
template:   users$ | async →
view:       render(users)
```

```typescript
@Component({
  template: `
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <app-user-card [user]="user" />
      }
    }
  `
})
export class UserListComponent {
  users$ = this.api.getUsers();
}
```

Если значение нужно только шаблону, AsyncPipe обычно проще ручного subscribe.

> Запомни: AsyncPipe = subscribe при создании + unsubscribe при уничтожении. Автоматически.

---

## Очистка подписок в Angular

Ручная подписка (imperative subscribe) — явный вызов `.subscribe()` в коде компонента. Её нужно остановить при уничтожении компонента.

| Подход | Описание |
|--------|----------|
| AsyncPipe | Шаблон сам подписывается и отписывается. Для значений, которые нужны только шаблону |
| `takeUntilDestroyed()` | Автоматически останавливает ручную подписку при уничтожении компонента |
| `takeUntil(destroy$)` | Классический вариант для старых версий Angular |

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  data$ = this.api.getData().pipe(
    takeUntilDestroyed()
  ); // отписка при уничтожении компонента
}
```

У каждой подписки есть владелец — и он обязан её остановить.

> Запомни: если можно AsyncPipe — используйте AsyncPipe. Если нельзя — `takeUntilDestroyed()` с подходящим injection context.

---

## takeUntilDestroyed и injection context

Вызов без аргумента доступен не в любом месте класса.

**Без аргумента** — работает в injection context: например, в инициализации поля или конструкторе.

**С DestroyRef** — передайте `DestroyRef` явно в `ngOnInit` и других обычных методах:

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.api.getLive().pipe(
    takeUntilDestroyed(this.destroyRef),
  ).subscribe();
}
```

Короткий API не отменяет необходимость понимать, кто владеет подпиской.

> Запомни: вызов без аргумента — только в injection context. В обычных методах — `takeUntilDestroyed(this.destroyRef)`.

---

## Итоги раздела

Базовые вопросы, на которые мы теперь умеем отвечать — попробуйте ответить сами:

- Почему HttpClient возвращает Observable, а не Promise?
- Как связать смену маршрута с запросом данных?
- Что делает AsyncPipe с подпиской?
- Где `takeUntilDestroyed()` работает без аргументов?

Затрудняетесь с ответом — самое время перечитать раздел, прежде чем идти дальше.

---

# Раздел 8. Практические паттерны

От продуктовой ситуации к оператору и коду

---

## Поиск по мере ввода

Демо-приложение · поиск в книжном маркетплейсе.

Ситуация: пользователь печатает быстро, а запрос на каждое нажатие клавиши — это шум и лишняя нагрузка на сервер.

Оператор: `debounceTime(300)` → `distinctUntilChanged()` → `switchMap`

```
input:    (r)-(rx)-(rxjs)-----------(rxj)----|
          ↓ debounceTime(300) + distinctUntilChanged()
filtered: --------(rxjs)-----------(rxj)----|
          ↓ switchMap(term → HTTP)
output:   -----------(results)-----(results)|
```

```typescript
this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.http.get('/api/books', { params: { term } }))
).subscribe(results => this.results = results);
```

Частая ошибка: запрос на каждый символ — или `mergeMap`, ответы которого приходят не по порядку.

---

## Быстрая навигация по каталогу

Демо-приложение · карточка товара.

Ситуация: пользователь листает товары быстрее, чем приходят ответы, — старые ответы уже никому не нужны.

Оператор: `switchMap`

```
params:   --(id:1)----(id:2)----(id:3)----|
          ↓ switchMap(id → HTTP)
inner:    --(data1) ✕                |     ← отменён
                    --(data2) ✕      |     ← отменён
                              --(data3)|
output:                       --(data3)|
```

```typescript
route.paramMap.pipe(
  switchMap(params => this.api.getBook(params.get('id')))
).subscribe(book => this.book = book);
```

Частая ошибка: `mergeMap` даёт гонку — ответ по старому товару может прийти последним и перезаписать новый.

---

## Submit формы заказа

Демо-приложение · оформление заказа.

Ситуация: двойной клик по кнопке «Оформить» не должен создавать два одинаковых заказа.

Оператор: `exhaustMap`

```
clicks:   --(click)--(click)--------(click)----|
          ↓ exhaustMap(() → POST)
requests: --(POST)----|           (POST)----|
              (второй click проигнорирован — занят)
```

```typescript
submit$.pipe(
  exhaustMap(() => this.http.post('/api/orders', form.value))
).subscribe(res => this.onSaved(res));
```

Частая ошибка: `mergeMap` отправит второй POST — заказ задвоится.

---

## Параллельные запросы

Демо-приложение · торговый дашборд.

Ситуация: дашборду нужны котировки четырёх активов, а грузить их по очереди — слишком медленно.

Оператор: `forkJoin`

```
httpA$:    -----(a)----|
httpB$:    ----------(b)----|
          ↓ forkJoin
result:   --------------([a,b])----|
```

```typescript
forkJoin(
  symbols.map(s => this.http.get(`/api/quotes/${s}`))
).subscribe(quotes => this.quotes = quotes);
```

Частая ошибка: если хотя бы один запрос не завершится, `forkJoin` не выдаст ничего.

---

## Что делать, если запрос упал

Демо-приложение · карточка профиля.

Ситуация: сервер иногда отвечает ошибкой. Экран не должен ломаться, а пользователь — видеть, что произошло.

Оператор: `retry` → `catchError`

```
http$:  --------(data)----X
        ↓ retry({ count: 2, delay: 1000 }) + catchError(err → of(null))
safe$:  ---------(data)----------(null)-----|
```

```typescript
this.http.get('/api/profile').pipe(
  retry({ count: 2, delay: 1000 }),
  catchError(() => of(null))
).subscribe(profile => this.profile = profile);
```

Частая ошибка: `catchError` обязан вернуть Observable — просто вернуть значение нельзя.

Если ошибку нужно передать дальше после логирования, верните `throwError`:

```typescript
this.http.get<User[]>('/api/users').pipe(
  catchError(error => {
    console.error('Cannot load users', error);
    return throwError(() => error);
  }),
);
```

`finalize` выполняется при успехе, ошибке или отмене:

```typescript
this.http.get<Data>('/api/data').pipe(
  retry({ count: 2, delay: 1000 }),
  finalize(() => this.loading = false),
);
```

---

## Фильтры и URL вместе

Ситуация: фильтры в форме и параметры в адресной строке должны всегда давать один и тот же запрос.

Оператор: `combineLatest` → `switchMap`

```
filters$:  --(f1)--------(f2)-----------|
params$:   ------(p1)------------------|
           ↓ combineLatest + switchMap(([f, p]) → API)
output:    ------(data1)--(data2)------|
```

```typescript
combineLatest([
  this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)),
  this.route.queryParams
]).pipe(
  switchMap(([filters, params]) =>
    this.http.get('/api/data', { params: { ...filters, ...params } })
  )
).subscribe(data => this.data = data);
```

Частая ошибка: два отдельных subscribe — состояние расходится, запросы конкурируют.

---

## Состояния экрана

Демо-приложение · карточка профиля.

Ситуация: пока идёт запрос — каркас-заглушка, затем данные или ошибка. Все три состояния должны быть явными.

Оператор: `startWith` → `map` → `catchError`

```
http$:     -----(data)----|
           ↓ startWith('loading') + catchError
view$:     (loading)--(data)----|

error:     -----(X error)----|
           ↓ catchError → of({ error })
view$:     (loading)--({ error })----|
```

```typescript
load$.pipe(
  switchMap(() => this.api.getProfile().pipe(
    map(p => ({ status: 'data', p } as ScreenState)),
    catchError(e => of({ status: 'error', e } as ScreenState)),
    startWith({ status: 'loading' } as ScreenState)
  ))
).subscribe(state => this.state = state);
```

Частая ошибка: один boolean `loading` не описывает данные и ошибку одновременно.

---

## Утечка подписки

Демо-приложение · музыкальный плеер.

Ситуация: плеер закрыли, а подписка живёт и обновляет экран, которого больше нет.

Оператор: `takeUntilDestroyed`

```
БЕЗ ОЧИСТКИ:   subscribe → component destroyed → callback всё ещё вызывается! [ошибка]
С ОЧИСТКОЙ:   subscribe → component destroyed → unsubscribe автоматически [ok]
```

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.player.track$.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(render);
}
```

Частая ошибка: ручной список подписок работает, но его легко забыть пополнить.

---

## Тестирование RxJS-потоков

TestScheduler управляет временем в тесте: паузы вроде `debounceTime(300)` не ждут по-настоящему.

```typescript
import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const scheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

scheduler.run(({ cold, expectObservable }) => {
  // '-a-b|' — компактная запись потока:
  // буква — значение, - — пауза, | — завершение
  const result$ = cold('-a-b|').pipe(
    map(v => v.toUpperCase())
  );
  // значения A и B в те же моменты времени
  expectObservable(result$).toBe('-A-B|');
});
```

- **Marble-строка — это поток:** «-a-b|» читается так: пауза, значение a, пауза, значение b, завершение.
- **Что проверяем:** порядок значений, моменты появления и завершение потока — а не только итоговый массив.
- Тест выполняется мгновенно: расписание событий задаётся строкой, а не настоящим временем.

Для Angular-компонентов дополнительно используйте mock-сервисы и `fakeAsync`/`tick`, а не реальные HTTP-запросы.

---

# Итоги

Памятка и алгоритм выбора оператора

---

## Памятка: ситуация → оператор

Сформулируйте задачу словами — оператор найдётся сам.

| Ситуация | Оператор |
|----------|----------|
| Нужна пауза после ввода | `debounceTime` |
| Убрать повторяющиеся значения | `distinctUntilChanged` |
| Отменить устаревший запрос | `switchMap` |
| Защитить submit от двойного клика | `exhaustMap` |
| Сохранить строгий порядок | `concatMap` |
| Запросы параллельно | `mergeMap` |
| Ждать все запросы разом | `forkJoin` |
| Реагировать на любое изменение | `combineLatest` |
| Задать начальное состояние | `startWith` |
| Автоматическая отписка | `takeUntilDestroyed` |

Как пользоваться: скажите задачу словами — «нужна пауза», «отменить прошлое» — и найдите строку в таблице.

Проверьте себя: все десять ситуаций разобраны в демо-приложении — сверьте таблицу с живым кодом.

> Запомни: сохраните эту памятку — она поможет быстро выбрать нужный оператор.

---

## Четыре вопроса перед выбором

Главное в higher-order операторах — поведение при конкуренции потоков:

1. **Отменять прошлое?** → `switchMap`
2. **Выполнять параллельно?** → `mergeMap`
3. **Сохранять очередь?** → `concatMap`
4. **Игнорировать повторы?** → `exhaustMap`

Сначала выберите поведение при конкуренции. Код оператора станет очевидным.

> Запомни: `switchMap` отменяет. `mergeMap` параллелит. `concatMap` ждёт. `exhaustMap` игнорирует.

---

## RxJS за пределами Angular

Тот же RxJS: в React — через rxjs-hooks, в чистом JavaScript — напрямую.

**React · rxjs-hooks:**

```typescript
const BookSearch = ({ term }) => {
  const books = useObservable(
    (inputs$) => inputs$.pipe(
      map(([t]) => t),
      debounceTime(300),
      switchMap((t) => api.get(`/api/books?term=${t}`))
    ),
    [],     // начальное значение
    [term]  // входные данные
  );
  return <List items={books ?? []} />;
};
```

**Чистый JavaScript:**

```javascript
const input = document.querySelector('#search');
const list  = document.querySelector('#results');

fromEvent(input, 'input').pipe(
  map((e) => e.target.value),
  debounceTime(300),
  switchMap((term) =>
    fetch(`/api/books?term=${term}`).then((r) => r.json())
  )
).subscribe((books) => {
  list.innerHTML = books
    .map((b) => `<li>${b.title}</li>`).join('');
});
```

Библиотека одна и та же — меняется только место подписки и способ очистки.

> Запомни: RxJS работает везде, где есть JavaScript. Angular, React, Vue — операторы одни и те же.

---

## Источники

Основные материалы для содержания и дальнейшего изучения:

- [RxJS documentation](https://rxjs.dev/) — официальная документация
- [RxJS course](https://rxjs-course-avy.web.app/lessons) — курс RxJS Ninja
- [Angular Challenges](https://angular-challenges.vercel.app/) — практические задачи
- [React-RxJS](https://react-rxjs.org/) — React-RxJS библиотека
- [rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks) — RxJS хуки для React

---

# Финал

**Интерфейс — это значения во времени.**

RxJS даёт язык, чтобы описать их движение, конкуренцию и превращение в состояние экрана.

```
event → pipe → state
```
