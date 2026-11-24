---
theme: default
title: RxJS — Реактивное программирование для фронтенд-разработчиков
info: |
  RxJS: Реактивное программирование для фронтенд-разработчиков.
  Учебная презентация и интерактивные задания.
transition: slide-left
mdc: false
colorSchema: light
canvasWidth: 980
class: comet-dark
---

<div class="flex items-center justify-between h-full gap-8 pt-4">
  <div class="flex flex-col max-w-[62%]">
    <span class="comet-pill">ЛЕКЦИЯ И ПРАКТИКА · ПОЛНЫЙ КУРС</span>
    <h1 class="!text-[4.2rem] !leading-[1.02] mt-2 mb-3">RxJS</h1>
    <div class="text-[1.95rem] font-bold leading-tight mb-4">
      Реактивное программирование<br />для фронтенд-разработчиков
    </div>
    <p class="comet-subtitle !text-[1.12rem]">
      Как описывать клики, живой поиск, сетевые запросы и состояние экрана едиными цепочками без ручных таймеров и флагов
    </p>
  </div>
  <div class="flex flex-col items-center gap-4 pr-6">
    <CometCat mood="idle" :size="145" dark caption="Помощник по потокам Кот Комет" />
    <div class="font-mono text-xs text-[#9f9d96] bg-[#201f1d] border border-[#3a372f] px-4 py-2 rounded-full">
      событие &nbsp;→&nbsp; pipe() &nbsp;→&nbsp; интерфейс
    </div>
  </div>
</div>

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 1 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Добро пожаловать в RX</h1>
<p class="comet-subtitle !text-[1.2rem]">Почему в интерфейсе всё происходит во времени и чем здесь помогает RxJS</p>

<SectionStepper :total="11" :active="1" />

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>В интерфейсе всё происходит во времени</h2>
<p class="comet-subtitle">Пользователь ставит лайки, набирает текст в поиске и переключает вкладки, а сервер отвечает с задержкой.</p>

<RxMiniApp scenario="events-timeline" />

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Почему привычных инструментов не всегда хватает</h2>
<p class="comet-subtitle">Когда нужно подождать паузу после набора текста и отменить прошлый запрос, в обычном коде появляется куча переменных: <code>timerId</code>, <code>isLoading</code> и <code>AbortController</code>.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card">
    <div class="title-red">Вложенные колбэки</div>
    <p class="text-sm text-[#3a372f] m-0">
      Когда одно действие запускает другое, функции вкладываются друг в друга. Такой код тяжело читать, а аккуратно прервать цепочку посередине почти нереально.
    </p>
  </div>
  <div class="comet-card">
    <div class="title-orange">Promise</div>
    <p class="text-sm text-[#3a372f] m-0">
      Хорош для одного запроса, но срабатывает только <strong>один раз</strong>. А в строке поиска или фильтре каталога новые значения приходят снова и снова.
    </p>
  </div>
  <div class="comet-card">
    <div class="title-blue">Слушатели событий</div>
    <p class="text-sm text-[#3a372f] m-0">
      С <code>addEventListener</code> всю логику приходится писать руками: заводить <code>setTimeout</code>, хранить прошлое значение для проверки повторов и не забывать вызывать <code>removeEventListener</code>.
    </p>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Императивный код против реактивного</h2>
<p class="comet-subtitle">Сравните два подхода: дёргать изменения вручную в каждом обработчике или один раз описать цепочку правил.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-orange">Императивный подход — управляем вручную</div>
    <p class="text-sm text-[#6e6c65] mb-2">Сами храним таймеры, прошлое значение и следим за порядком вызовов:</p>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">let timerId: any;
let lastQuery = '';
input.addEventListener('input', (e) =&gt; {
  clearTimeout(timerId);
  timerId = setTimeout(() =&gt; {
    if (e.target.value !== lastQuery) {
      lastQuery = e.target.value;
      loadBooks(lastQuery);
    }
  }, 300);
});</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal">Реактивный подход (RxJS) — описываем поток</div>
    <p class="text-sm text-[#6e6c65] mb-2">Собираем обработку событий как конвейер из готовых шагов:</p>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query =&gt; loadBooks(query))
).subscribe(books =&gt; {
  this.books = books;
});</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX · ПРИМЕР ИЗ ЖИЗНИ</span>
<h2>Как работает живой поиск книг по шагам</h2>
<p class="comet-subtitle">Попробуйте набрать запрос в мини-приложении и посмотрите, как событие проходит все 4 этапа:</p>

<RxMiniApp scenario="book-search" />

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Чем Observable отличается от Promise</h2>
<p class="comet-subtitle">Четыре практических отличия, которые определяют выбор инструмента в коде.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-orange"><code>Promise</code> — однократный результат</div>
    <ul class="text-sm space-y-1.5 pl-4 m-0">
      <li>возвращает <strong>только одно значение</strong> и завершается</li>
      <li>запускается <strong>сразу при создании</strong>, даже без <code>.then()</code></li>
      <li>нельзя просто отменить штатным методом самого промиса</li>
    </ul>
    <pre v-pre class="comet-card--code p-2.5 rounded mt-3 mb-0">// Запрос уже ушёл в сеть:
const p = fetch('/api/user');</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal"><code>Observable</code> — поток значений во времени</div>
    <ul class="text-sm space-y-1.5 pl-4 m-0">
      <li>выдаёт <strong>0, 1 или сколько угодно</strong> значений подряд</li>
      <li>ленивый: стартует <strong>только при вызове</strong> <code>subscribe()</code></li>
      <li>легко отменяется в любой момент через <code>unsubscribe()</code></li>
    </ul>
    <pre v-pre class="comet-card--code p-2.5 rounded mt-3 mb-0">// Запрос пойдёт только после subscribe:
const sub = stream$.subscribe(render);
sub.unsubscribe(); // отменили</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Почему RxJS так важен в Angular</h2>
<p class="comet-subtitle">Многие встроенные механизмы Angular уже построены на потоках, поэтому разные действия пользователя легко связывать вместе.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card">
    <div class="title-teal">1. Сетевые запросы</div>
    <p class="text-sm text-[#3a372f] mb-3">
      <code>HttpClient</code> возвращает поток. Благодаря этому незавершённый запрос сам прерывается, если пользователь передумал и ушёл со страницы.
    </p>
    <div class="font-mono text-xs text-[#01696f] bg-[#e3ece8] px-2.5 py-1.5 rounded">
      this.http.get('/api/books')
    </div>
  </div>
  <div class="comet-card">
    <div class="title-blue">2. Роутер и адресная строка</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Смена <code>id</code> товара в URL или параметров фильтрации приходит как поток событий без перезагрузки компонента.
    </p>
    <div class="font-mono text-xs text-[#006494] bg-[#e5eef5] px-2.5 py-1.5 rounded">
      route.paramMap, route.queryParams
    </div>
  </div>
  <div class="comet-card">
    <div class="title-orange">3. Смешивание событий</div>
    <p class="text-sm text-[#3a372f] mb-3">
      В одном <code>pipe()</code> можно легко объединить ввод в форму, клики по кнопкам и параметры URL в единую цепочку загрузки данных.
    </p>
    <div class="font-mono text-xs text-[#da7101] bg-[#f7ebd9] px-2.5 py-1.5 rounded">
      control.valueChanges + fromEvent()
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="1" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 2 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Базовые элементы</h1>
<p class="comet-subtitle !text-[1.2rem]">Как запускается поток, какие сигналы он подаёт и почему важно закрывать подписки</p>

<SectionStepper :total="11" :active="2" />

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2>Поток запускается только при вызове <code>subscribe()</code></h2>
<p class="comet-subtitle">Обычный (холодный) Observable работает как чертёж: пока вы не нажали <code>subscribe()</code>, код внутри не выполняется.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card comet-card--code flex flex-col justify-center">
    <span class="comet-pill mb-2">ОБЪЯВЛЕНИЕ И ЗАПУСК</span>
    <div class="font-mono text-xs leading-relaxed">
      <div>const stream$ = of(1, 2, 3);</div>
      <div class="text-[#6e6c65]">// 1. Просто описали поток — тишина</div>
      <div class="mt-3">stream$.subscribe(v =&gt; console.log(v));</div>
      <div class="text-[#01696f] font-bold">// 2. Подписались — вывелось: 1, 2, 3</div>
    </div>
  </div>
  <div class="flex flex-col gap-3">
    <div class="comet-card">
      <div class="title-teal">Каждая подписка — новый запуск</div>
      <p class="text-sm m-0">
        Если подписаться на <code>http.get('/api/users')</code> в двух компонентах, в сеть уйдёт <strong>два отдельных запроса</strong>.
      </p>
    </div>
    <div class="comet-card">
      <div class="title-orange">Ловушка с готовым Promise</div>
      <p class="text-sm m-0">
        Если написать <code>from(fetch('/api'))</code>, то <code>fetch()</code> вызовется мгновенно ещё до подписки.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2>Три сигнала потока: <code>next</code>, <code>error</code> и <code>complete</code></h2>
<p class="comet-subtitle">Проверьте на карточке профиля, как поток отдаёт данные и закрывается при успехе или сбое:</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="signals-profile" />
  <div class="flex flex-col gap-2.5">
    <div class="comet-card !py-2.5">
      <div class="title-teal !text-sm"><code>next(value)</code> — пришли данные</div>
      <p class="text-xs m-0 text-[#3a372f]">
        Передаёт новое значение подписчику. Может сработать один раз (HTTP) или много раз (клики, таймер).
      </p>
    </div>
    <div class="comet-card !py-2.5">
      <div class="title-green !text-sm"><code>complete()</code> — успешный финал</div>
      <p class="text-xs m-0 text-[#3a372f]">
        Задача выполнена, поток закрылся. Новых значений больше не придёт.
      </p>
    </div>
    <div class="comet-card !py-2.5">
      <div class="title-red !text-sm"><code>error(err)</code> — сбой и остановка</div>
      <p class="text-xs m-0 text-[#3a372f]">
        Поток аварийно закрывается. После ошибки ни <code>next</code>, ни <code>complete</code> уже не вызовутся.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2>Три вида <code>Subject</code>: когда мы сами пушим данные</h2>
<p class="comet-subtitle">У любого <code>Subject</code> есть метод <code>.next()</code> снаружи. Разница в том, что получит подписчик, который подключился позже:</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-blue"><code>Subject</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        <strong>Не хранит прошлых значений.</strong> Кто подписался позже вызова <code>next()</code>, старые события уже не увидит. Подходит для кликов и команд.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded m-0">const send$ = new Subject&lt;void&gt;();
send$.next(); // никто не услышал
send$.subscribe(submitForm);
send$.next(); // сработает!</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal"><code>BehaviorSubject</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        <strong>Хранит текущее значение.</strong> Требует стартовое значение при создании и мгновенно отдаёт последнее состояние каждому новому подписчику.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded m-0">const page$ = new BehaviorSubject(1);
// Сразу получит текущую 1:
page$.subscribe(renderPage);
page$.next(2); // все получат 2</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange"><code>ReplaySubject(N)</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        <strong>Помнит N последних событий.</strong> Начальное значение не нужно: при подписке выдаёт из буфера последние <code>N</code> значений по очереди.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded m-0">const log$ = new ReplaySubject(2);
log$.next('A');
log$.next('B');
// Сразу получит 'A', затем 'B':
log$.subscribe(console.log);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2>Зачем закрывать подписки</h2>
<p class="comet-subtitle">Компонент уже закрыли, а забытая подписка продолжает работать в фоне и тратить память.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="player-leak" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded m-0">const sub = interval(1000).subscribe(tick);
// При закрытии компонента:
sub.unsubscribe();</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm">Как не писать <code>unsubscribe()</code> руками</div>
      <p class="text-xs text-[#3a372f] m-0">
        В Angular мы используем пайп <code>| async</code> в шаблоне или оператор <code>takeUntilDestroyed()</code> — они сами остановят поток, когда пользователь уйдёт со страницы.
      </p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="2" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 3 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Операторы создания</h1>
<p class="comet-subtitle !text-[1.2rem]">Из чего и как можно собрать поток: готовые данные, массивы, промисы и таймеры</p>

<SectionStepper :total="11" :active="3" />

---
transition: slide-left
---

<span class="comet-pill">ОПЕРАТОРЫ СОЗДАНИЯ</span>
<h2><code>of()</code> и <code>from()</code> — когда какой нужен на практике</h2>
<p class="comet-subtitle">Один отдаёт данные целиком (для заглушек и кеша), а другой разбирает массив по элементам или ждёт <code>Promise</code>.</p>

<div class="comet-grid-2 mb-3">
  <div class="comet-card !py-2.5">
    <div class="title-orange !text-sm"><code>of(items)</code> — отдать готовый список сразу</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Полезно для моков в тестах и запасного ответа в <code>catchError(() => of([]))</code>, когда шаблон ждёт весь массив сразу.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded m-0">of(['📱', '🎧']).subscribe(list =&gt; renderAll(list));</pre>
  </div>
  <div class="comet-card !py-2.5">
    <div class="title-teal !text-sm"><code>from(items)</code> — обработать по одному</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Нужен, когда массив файлов или ID надо отправлять на сервер поштучно. Ещё <code>from(promise)</code> превращает промис в поток.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded m-0">from(files).pipe(concatMap(f =&gt; upload(f)));</pre>
  </div>
</div>

<RxMiniApp scenario="of-vs-from" />

---
transition: slide-left
---

<span class="comet-pill">ОПЕРАТОРЫ СОЗДАНИЯ</span>
<h2><code>defer()</code>, <code>EMPTY</code> и <code>throwError()</code></h2>
<p class="comet-subtitle">Как вычислять данные в момент подписки, тихо завершать поток или пробрасывать ошибку.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal"><code>defer(() => ...)</code> — расчёт в момент подписки</div>
      <p class="text-xs text-[#3a372f] mb-2">
        В <code>of(Date.now())</code> время зафиксируется один раз при старте файла. А <code>defer</code> вызывает колбэк заново при каждом вызове <code>subscribe()</code>.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">let count = 0;
const req$ = defer(() =&gt; of(++count));
req$.subscribe(console.log); // 1
req$.subscribe(console.log); // 2
// Делаем fetch() ленивым:
const api$ = defer(() =&gt; from(fetch('/api')));</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-red"><code>EMPTY</code> и <code>throwError()</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        <code>EMPTY</code> ничего не эмитит и сразу закрывается через <code>complete()</code>. А <code>throwError</code> передаёт ошибку дальше в обработчик.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">this.http.get('/api/profile').pipe(
  catchError(err =&gt; {
    this.showToast('Не удалось загрузить');
    // Тихо остановить цепочку:
    return EMPTY;
    // Или пробросить: return throwError(() =&gt; err);
  })
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОПЕРАТОРЫ СОЗДАНИЯ</span>
<h2>Таймеры <code>timer()</code>, <code>interval()</code> и <code>take(N)</code></h2>
<p class="comet-subtitle">Внутри <code>interval(1000)</code> работает обычный <code>setInterval</code> — он выдаёт числа <code>0, 1, 2...</code> каждую секунду, пока мы сами его не остановим.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="promo-timer" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Один раз через 500 мс (как setTimeout):
timer(500).subscribe(() =&gt; hideBanner());
// Ровно 3 шага каждую секунду и стоп:
interval(1000).pipe(
  take(3)
).subscribe(step =&gt; console.log(step));</pre>
    <div class="comet-card">
      <div class="title-green !text-sm">Как <code>take(3)</code> останавливает таймер</div>
      <p class="text-xs text-[#3a372f] m-0">
        Как только <code>take(3)</code> получает третье значение, он вызывает <code>complete()</code> и автоматически очищает внутренний <code>setInterval</code>.
      </p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="3" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 4 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Цепочка pipe и операторы</h1>
<p class="comet-subtitle !text-[1.2rem]">Как данные проходят через конвейер операторов и обновляют интерфейс</p>

<SectionStepper :total="11" :active="4" />

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2>Как работает конвейер <code>pipe()</code></h2>
<p class="comet-subtitle">Каждый товар по очереди проходит через <code>filter</code> (проверка склада) и <code>map</code> (расчёт скидки):</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="pipe-catalog" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">from(products).pipe(
  filter(item =&gt; item.inStock),
  map(item =&gt; ({
    ...item,
    price: item.price * 0.9
  }))
).subscribe(item =&gt; renderCard(item));</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm">Сначала фильтруйте, потом преобразуйте</div>
      <p class="text-xs text-[#3a372f] m-0">
        Ставьте <code>filter</code> перед <code>map</code>, чтобы не считать скидки и не создавать лишние объекты для товаров, которых нет в наличии.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>map()</code> и <code>tap()</code> — в чём отличие</h2>
<p class="comet-subtitle">Один оператор меняет данные для экрана, а второй выполняет попутное действие, не трогая само значение.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-teal"><code>map(fn)</code> — преобразует данные</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Принимает значение, возвращает новое и передаёт его следующему оператору. Например, собирает полное имя пользователя из ответа сервера.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">http.get&lt;UserDto&gt;('/api/user').pipe(
  map(dto =&gt; ({
    id: dto.id,
    fullName: `${dto.firstName} ${dto.lastName}`
  }))
);</pre>
  </div>
  <div class="comet-card">
    <div class="title-orange"><code>tap(fn)</code> — действие со стороны</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Нужен для <code>console.log</code>, аналитики или переключения флага. Что бы вы ни вернули из <code>tap</code>, дальше пойдёт исходное значение.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">this.http.get('/api/items').pipe(
  tap(() =&gt; console.log('Запрос выполнен')),
  map(res =&gt; res.items)
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>startWith()</code> — мгновенный старт экрана</h2>
<p class="comet-subtitle">Выдаёт стартовое значение в ту же миллисекунду, когда вызвали <code>subscribe()</code>, не дожидаясь ответа сервера.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="start-with-profile" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">state$ = this.api.getProfile().pipe(
  map(user =&gt; ({ status: 'ready', user })),
  startWith({ status: 'loading' })
);</pre>
    <div class="comet-card">
      <div class="title-green !text-sm">Зачем он нужен в UI</div>
      <p class="text-xs text-[#3a372f] m-0">
        Сразу показывает скелетон загрузки или задаёт начальную пустую строку <code>startWith('')</code> для фильтров формы, пока пользователь ещё ничего не ввёл.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>distinctUntilChanged()</code> — защита от повторов подряд</h2>
<p class="comet-subtitle">Сравнивает новое значение с предыдущим. Если пользователь кликнул на уже открытую вкладку — запрос не дублируется.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="distinct-tabs" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">categoryTab$.pipe(
  distinctUntilChanged(),
  switchMap(cat =&gt; this.api.getItems(cat))
);</pre>
    <div class="comet-card">
      <div class="title-blue !text-sm">Сравнение объектов</div>
      <p class="text-xs text-[#3a372f] m-0">
        По умолчанию проверяет равенство через <code>===</code>. Для объектов можно передать свою функцию: <code>distinctUntilChanged((a, b) => a.id === b.id)</code>.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>debounceTime(300)</code> — ждём паузу при вводе</h2>
<p class="comet-subtitle">Каждое нажатие клавиши сбрасывает таймер на 0. Запрос уйдёт только тогда, когда пользователь остановился на 300 мс.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="debounce-search" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(query =&gt; {
  this.loadBooks(query);
});</pre>
    <div class="comet-card">
      <div class="title-orange !text-sm">Экономия запросов</div>
      <p class="text-xs text-[#3a372f] m-0">
        Вместо 4 запросов на каждую букву слова <code>rxjs</code> сервер получит всего 1 итоговый запрос после короткой паузы.
      </p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="4" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 5 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Потоки внутри потоков</h1>
<p class="comet-subtitle !text-[1.2rem]">Четыре стратегии управления запросами: switchMap, mergeMap, concatMap и exhaustMap</p>

<SectionStepper :total="11" :active="5" />

---
transition: slide-left
---

<span class="comet-pill">ПОТОКИ ВНУТРИ ПОТОКОВ</span>
<h2>Когда одно событие запускает HTTP-запрос</h2>
<p class="comet-subtitle">Клик или ввод текста в потоке создаёт новый внутренний поток <code>http.get()</code>. Нужно решить, что делать, если старый запрос ещё не завершился.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-red">Что будет без управления</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Сеть работает с разной скоростью. Если пользователь быстро переключил вкладку с Товар 1 на Товар 2, медленный ответ от первого товара может прийти позже и затереть экран.
    </p>
    <p class="text-sm text-[#3a372f] m-0">
      А случайный двойной клик по кнопке «Оплатить» отправит два заказа подряд.
    </p>
  </div>
  <div class="comet-card flex flex-col justify-center gap-2.5">
    <div class="title-teal">Четыре оператора под каждую задачу</div>
    <div class="p-2 rounded bg-[#e3ece8] text-xs font-semibold">
      <code>switchMap</code> — <strong>отменить прошлый запрос</strong> (поиск, смена товара)
    </div>
    <div class="p-2 rounded bg-[#e5eef5] text-xs font-semibold">
      <code>mergeMap</code> — <strong>грузить параллельно</strong> (независимые карточки, акции)
    </div>
    <div class="p-2 rounded bg-[#f7ebd9] text-xs font-semibold">
      <code>concatMap</code> — <strong>поставить в очередь</strong> (пошаговое сохранение)
    </div>
    <div class="p-2 rounded bg-[#e2ede6] text-xs font-semibold">
      <code>exhaustMap</code> — <strong>игнорировать новые клики</strong> (кнопка оплаты/входа)
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ПОТОКИ ВНУТРИ ПОТОКОВ · СРАВНЕНИЕ НА ВИДЖЕТАХ</span>
<h2>Попробуйте все 4 оператора в деле</h2>

<HigherOrderExplorer />

---
transition: slide-left
---

<span class="comet-pill">ПОТОКИ ВНУТРИ ПОТОКОВ · ЛИМИТ ПАРАЛЛЕЛЬНОСТИ</span>
<h2>Ограничение параллельности: <code>mergeMap(fn, N)</code></h2>
<p class="comet-subtitle">Отправлять 50 тяжёлых файлов одновременно — перегрузка сети, а по одному — долго. Второй аргумент задаёт число активных слотов.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="upload-limit" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">from(files).pipe(
  // Максимум 2 загрузки одновременно:
  mergeMap(file =&gt; this.upload(file), 2)
).subscribe();</pre>
    <div class="comet-card">
      <div class="title-blue !text-sm">Связь с <code>concatMap</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        Вызов <code>mergeMap(fn, 1)</code> разрешает только 1 активный запрос за раз — это в точности поведение оператора <code>concatMap(fn)</code>.
      </p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="5" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 6 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Объединение нескольких потоков</h1>
<p class="comet-subtitle !text-[1.2rem]">merge, concat, combineLatest, withLatestFrom и forkJoin</p>

<SectionStepper :total="11" :active="6" />

---
transition: slide-left
---

<span class="comet-pill">ОБЪЕДИНЕНИЕ ПОТОКОВ</span>
<h2><code>merge()</code> и <code>concat()</code> — общая лента или очередь</h2>
<p class="comet-subtitle">Объединяют несколько потоков событий в один общий поток.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-blue"><code>merge(a$, b$)</code> — слушать оба сразу</div>
      <p class="text-sm text-[#3a372f] mb-3">
        Подписывается на все потоки одновременно. Какое событие произошло раньше — то сразу и проходит дальше.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Отправка по кнопке ИЛИ клавише Enter:
const submit$ = merge(
  saveBtnClicks$,
  enterKeyPress$
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange"><code>concat(a$, b$)</code> — строго по очереди</div>
      <p class="text-sm text-[#3a372f] mb-3">
        Ждёт, пока первый поток полностью завершится (<code>complete</code>), и только после этого подписывается на второй.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Сначала быстрый кеш, следом сервер:
const products$ = concat(
  this.getCachedProducts(),
  this.http.get('/api/products')
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОБЪЕДИНЕНИЕ ПОТОКОВ</span>
<h2><code>combineLatest()</code> — общая панель фильтров</h2>
<p class="comet-subtitle">Ждёт хотя бы по одному значению от каждого фильтра, а дальше пересчитывает каталог при изменении любого из них.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="combine-filters" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">catalog$ = combineLatest([
  category$.pipe(startWith('Книги')),
  sort$.pipe(startWith('Популярные'))
]).pipe(
  switchMap(([cat, sort]) =&gt;
    this.api.getItems(cat, sort)
  )
);</pre>
    <div class="comet-card">
      <div class="title-orange !text-sm">Зачем здесь <code>startWith()</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        Если хотя бы один фильтр ещё не выдал стартовое значение, <code>combineLatest</code> будет молчать. Со <code>startWith</code> витрина загружается сразу.
      </p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="6" />

---
transition: slide-left
---

<span class="comet-pill">ОБЪЕДИНЕНИЕ ПОТОКОВ</span>
<h2><code>withLatestFrom()</code> — главный клик + фоновые данные</h2>
<p class="comet-subtitle">Когда действие должно запускаться <strong>только по кнопке</strong>, но внутри нужно подсмотреть текущее состояние из другого потока.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="with-latest-save" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">saveClick$.pipe(
  withLatestFrom(this.userRole$),
  switchMap(([_, role]) =&gt;
    this.api.saveDocument(role)
  )
);</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm">Отличие от <code>combineLatest</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        Попробуйте переключить роль в виджете слева: сам по себе выбор роли запрос не отправляет. Запрос уйдёт только по нажатию «Сохранить».
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОБЪЕДИНЕНИЕ ПОТОКОВ</span>
<h2><code>forkJoin()</code> — дождаться всех запросов</h2>
<p class="comet-subtitle">Аналог <code>Promise.all</code>: запускает запросы параллельно и отдаёт единый объект, когда завершился каждый из них.</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="forkjoin-assets" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">forkJoin({
  btc: this.api.getQuote('BTC'),
  eth: this.api.getQuote('ETH'),
  sp500: this.api.getQuote('SP500')
}).subscribe(quotes =&gt; {
  this.renderDashboard(quotes);
});</pre>
    <div class="comet-card">
      <div class="title-red !text-sm">Только для конечных потоков</div>
      <p class="text-xs text-[#3a372f] m-0">
        <code>forkJoin</code> ждёт сигнала <code>complete()</code>. Для HTTP-запросов это отлично работает, а на бесконечном <code>valueChanges</code> ответа не будет никогда.
      </p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="7" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 7 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Ошибки и завершение</h1>
<p class="comet-subtitle !text-[1.2rem]">catchError внутри switchMap, повторные попытки retry и уборка в finalize</p>

<SectionStepper :total="11" :active="7" />

---
transition: slide-left
---

<span class="comet-pill">ОШИБКИ И ЗАВЕРШЕНИЕ</span>
<h2>Почему <code>catchError</code> ставят внутри <code>switchMap</code></h2>
<p class="comet-subtitle">Ошибка закрывает тот поток, в котором её поймали. Если ошибка выскочит в главный поток ввода, строка поиска отключится навсегда.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-red">Ошибка снаружи — поиск умирает</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Один сбой сети завершает весь внешний поток <code>searchText$</code>. Дальше пользователь печатает, но ничего не происходит:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">searchText$.pipe(
  switchMap(q =&gt; this.api.search(q)),
  // Плохо: весь searchText$ закроется!
  catchError(() =&gt; of([]))
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-green">Ошибка внутри — поиск живёт дальше</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Ловим сбой внутри маленького потока <code>api.search(q)</code> и подменяем на пустой массив <code>of([])</code>. Главный поток продолжает слушать ввод:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">searchText$.pipe(
  switchMap(q =&gt;
    this.api.search(q).pipe(
      // Хорошо: гасим сбой одного запроса
      catchError(() =&gt; of([]))
    )
  )
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОШИБКИ И ЗАВЕРШЕНИЕ</span>
<h2><code>retry()</code> и <code>finalize()</code> — повтор и выключение спиннера</h2>
<p class="comet-subtitle">Как автоматически повторить случайно упавший запрос и гарантированно убрать индикатор загрузки.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange"><code>retry(N)</code> — вторая попытка</div>
      <p class="text-sm text-[#3a372f] mb-3">
        Если запрос упал, <code>retry(2)</code> сам переподпишется на него ещё до 2 раз. Всегда ставится <strong>перед</strong> <code>catchError</code>.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">this.http.get('/api/items').pipe(
  retry({ count: 2, delay: 500 }),
  catchError(() =&gt; of([]))
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal"><code>finalize(fn)</code> — сработает при любом исходе</div>
      <p class="text-sm text-[#3a372f] mb-3">
        Выполняется при успехе, при ошибке и даже при отмене запроса через <code>unsubscribe</code> или <code>switchMap</code>.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">this.loading = true;
this.http.get('/api/items').pipe(
  finalize(() =&gt; {
    this.loading = false;
  })
).subscribe();</pre>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="8" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 8 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Многоадресные потоки и кеш</h1>
<p class="comet-subtitle !text-[1.2rem]">Холодные и горячие потоки, операторы share и shareReplay</p>

<SectionStepper :total="11" :active="8" />

---
transition: slide-left
---

<span class="comet-pill">МНОГОАДРЕСНЫЕ ПОТОКИ И КЕШ</span>
<h2>Холодный поток против общего (горячего)</h2>
<p class="comet-subtitle">Почему три пайпа <code>| async</code> в шаблоне могут случайно отправить три одинаковых запроса на сервер.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange">Холодный поток (по умолчанию в <code>HttpClient</code>)</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Каждый новый подписчик запускает выполнение заново. Если вывести <code>user$ | async</code> в шапке и в профиле, уйдёт <strong>2 сетевых запроса</strong>:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Без кеша:
user$ = this.http.get('/api/user');
// Подписка 1 (шапка) → GET /api/user
// Подписка 2 (меню)  → GET /api/user</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">Общий поток — один запуск на всех</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Под капотом ставится внутренний <code>Subject</code>: запрос к серверу выполняется <strong>один раз</strong>, а ответ раздаётся всем компонентам:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// С общим буфером:
user$ = this.http.get('/api/user').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);
// Подписка 1 и 2 → всего 1 запрос в сеть!</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">МНОГОАДРЕСНЫЕ ПОТОКИ И КЕШ</span>
<h2><code>share()</code> и <code>shareReplay(1)</code> — в чём разница</h2>
<p class="comet-subtitle">Оба объединяют подписчиков, но по-разному ведут себя с теми, кто подключился позже.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-blue"><code>share()</code> — только пока поток жив</div>
      <p class="text-sm text-[#3a372f] mb-3">
        Делит поток между текущими подписчиками, но <strong>не хранит ответ в памяти</strong>. Когда все отписались или запрос завершился, следующий подписчик запустит запрос заново.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Хорошо для живых сокетов и таймеров:
const livePrices$ = this.ws.messages$.pipe(
  share()
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-green"><code>shareReplay(1)</code> — кеширует последний ответ</div>
      <p class="text-sm text-[#3a372f] mb-3">
        Запоминает последнее значение в буфере. Даже если второй компонент открылся через минуту после завершения HTTP-запроса, он мгновенно получит ответ из кеша.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Идеально для справочников и профиля:
config$ = this.http.get('/api/config').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);</pre>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="9" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 9 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Накопление состояния и эффекты</h1>
<p class="comet-subtitle !text-[1.2rem]">Оператор scan, паттерн редюсера и асинхронные эффекты</p>

<SectionStepper :total="11" :active="9" />

---
transition: slide-left
---

<span class="comet-pill">СОСТОЯНИЕ И ЭФФЕКТЫ</span>
<h2><code>scan()</code> — накапливаем состояние на каждом шаге</h2>
<p class="comet-subtitle">Работает как <code>Array.reduce</code>, но отдаёт обновлённый итог сразу после каждого клика пользователя:</p>

<div class="comet-grid-2 my-auto items-center">
  <RxMiniApp scenario="scan-cart" />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">totalPrice$ = cartActions$.pipe(
  scan((sum, price) =&gt; sum + price, 0)
);
// Клик +1200 → 1200
// Клик +3500 → 4700</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm">Зачем это в компонентах</div>
      <p class="text-xs text-[#3a372f] m-0">
        Позволяет собирать корзину покупок, бесконечную ленту постов при скролле или счётчик попыток без внешних мутабельных переменных.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">СОСТОЯНИЕ И ЭФФЕКТЫ</span>
<h2>Редюсер на <code>scan()</code> и паттерн эффектов</h2>
<p class="comet-subtitle">На этих двух приёмах устроены стейт-менеджеры вроде NgRx.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">1. Редюсер: действия → состояние</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Принимает текущее состояние и объект действия (<code>action</code>), возвращая обновлённый массив или объект:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">state$ = actions$.pipe(
  scan((state, action) =&gt; {
    if (action.type === 'add') {
      return [...state, action.item];
    }
    if (action.type === 'clear') return [];
    return state;
  }, [] as string[])
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange">2. Эффект: действие → запрос к API</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Ловит нужную команду через <code>filter</code>, обращается к серверу и возвращает событие об успешном сохранении:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">saveEffect$ = actions$.pipe(
  filter(a =&gt; a.type === 'save'),
  concatMap(a =&gt;
    this.api.save(a.payload).pipe(
      map(() =&gt; ({ type: 'saved' }))
    )
  )
);</pre>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="10" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 10 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">RxJS в Angular</h1>
<p class="comet-subtitle !text-[1.2rem]">Как связывать потоки в компонентах и безопасно управлять подписками</p>

<SectionStepper :total="11" :active="10" />

---
transition: slide-left
---

<span class="comet-pill">RXJS В ANGULAR</span>
<h2>Три главных источника потоков в компоненте</h2>
<p class="comet-subtitle">Почти любой экран в Angular собирается из сетевых запросов, параметров маршрута и полей форм.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">1. Запросы <code>HttpClient</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        Запрос стартует при подписке, а при отписке браузер сам отменяет незавершённый HTTP-вызов.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded m-0">getUser(id: string) {
  return this.http.get&lt;User&gt;(
    `/api/users/${id}`
  );
}</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-blue">2. Маршрут <code>route.paramMap</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        При переходе между товарами роутер эмитит новый <code>id</code>, а <code>switchMap</code> запрашивает свежую карточку.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded m-0">item$ = this.route.paramMap.pipe(
  switchMap(p =&gt;
    this.getItem(p.get('id')!)
  )
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange">3. Формы <code>valueChanges</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        Каждое изменение поля ввода проходит через паузу, фильтр дублей и запрашивает список с сервера.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded m-0">books$ = this.q.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q =&gt; this.find(q))
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">RXJS В ANGULAR</span>
<h2>Как не забывать отписываться в Angular</h2>
<p class="comet-subtitle">Два стандартных способа привязать жизнь потока к жизни компонента.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-green">1. В шаблоне: <code>| async</code> или <code>toSignal()</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        Если данные нужны для отрисовки, не вызывайте <code>subscribe()</code> руками. Angular сам подпишется и сам закроет подписку при удалении компонента:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Через пайп в шаблоне:
@if (users$ | async; as users) {
  &lt;app-list [items]="users" /&gt;
}
// Или через сигнал в компоненте:
users = toSignal(this.users$, { initialValue: [] });</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">2. В коде класса: <code>takeUntilDestroyed()</code></div>
      <p class="text-xs text-[#3a372f] mb-2">
        Для ручного <code>subscribe()</code> добавьте <code>takeUntilDestroyed</code>. В конструкторе он вызывается пустым, а в <code>ngOnInit</code> принимает <code>this.destroyRef</code>:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">private destroyRef = inject(DestroyRef);
ngOnInit() {
  this.player.track$.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(t =&gt; this.onTrack(t));
}</pre>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="11" />

---
class: comet-dark
transition: fade-out
---

<span class="comet-pill mt-4">РАЗДЕЛ 11 ИЗ 11</span>
<h1 class="!text-[3.2rem] mt-2">Практические рецепты и тесты</h1>
<p class="comet-subtitle !text-[1.2rem]">Готовые связки для форм и кнопок, свои операторы и финальный liveSearch</p>

<SectionStepper :total="11" :active="11" />

---
transition: slide-left
---

<span class="comet-pill">ПРАКТИЧЕСКИЕ РЕЦЕПТЫ</span>
<h2>Готовые рецепты: автосохранение и защита кнопок</h2>
<p class="comet-subtitle">Три частые задачи в рабочих проектах, которые решаются парой операторов.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">1. Автосохранение черновика формы</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Ждём паузу после набора текста, проверяем, что значение изменилось, и отправляем запрос сохранения:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">draftControl.valueChanges.pipe(
  debounceTime(400),
  distinctUntilChanged(),
  switchMap(text =&gt; this.api.saveDraft(text))
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange">2. Кнопка без дублей и запрос по цепочке</div>
      <p class="text-xs text-[#3a372f] mb-2">
        <code>exhaustMap</code> защищает от двойного клика по кнопке, а <code>concatMap</code> выполняет второй запрос после первого:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">// Защита кнопки оплаты от второго клика:
payClick$.pipe(
  exhaustMap(() =&gt; this.api.checkout())
);
// Загрузка профиля после входа:
login$().pipe(
  concatMap(u =&gt; this.api.getProfile(u.id))
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ПРАКТИЧЕСКИЕ РЕЦЕПТЫ И ТЕСТЫ</span>
<h2>Свои операторы и быстрые Marble-тесты</h2>
<p class="comet-subtitle">Повторяющуюся цепочку легко вынести в функцию и протестировать без реального ожидания таймеров.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">Свой оператор — это обычная функция</div>
      <p class="text-xs text-[#3a372f] mb-2">
        Принимает поток <code>source$</code> и возвращает <code>source$.pipe(...)</code>. Удобно для переиспользования в разных компонентах:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">function debugLog&lt;T&gt;(tag: string) {
  return (source$: Observable&lt;T&gt;) =&gt;
    source$.pipe(
      tap(v =&gt; console.log(`[${tag}]`, v))
    );
}
// В коде:
items$.pipe(debugLog('Каталог'));</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-blue">Тестирование в виртуальном времени</div>
      <p class="text-xs text-[#3a372f] mb-2">
        <code>TestScheduler</code> проверяет цепочки по текстовой строке <code>-a-b|</code> за миллисекунды, не дожидаясь реальных секунд:
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2.5 rounded m-0">scheduler.run(({ cold, expectObservable }) =&gt; {
  const in$ = cold('-a-b-c|', { a: 1, b: 2, c: 3 });
  const out$ = in$.pipe(
    filter(x =&gt; x &gt; 1),
    map(x =&gt; x * 10)
  );
  expectObservable(out$).toBe(
    '---b-c|',
    { b: 20, c: 30 }
  );
});</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ФИНАЛЬНЫЙ ПРОЕКТ КУРСА</span>
<h2>Полный оператор <code>liveSearch</code> для продакшена</h2>
<p class="comet-subtitle">Собираем в одну функцию паузу при вводе, отмену устаревших запросов, повторную попытку и защиту от падения.</p>

<div class="comet-grid-2 my-auto items-stretch">
  <div class="comet-card comet-card--code flex flex-col justify-center !p-3">
    <pre v-pre class="m-0">function liveSearch&lt;T&gt;(
  searchFn: (q: string) =&gt; Observable&lt;T[]&gt;
) {
  return (source$: Observable&lt;string&gt;) =&gt;
    source$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query =&gt;
        searchFn(query).pipe(
          retry(1),
          catchError(() =&gt; of([]))
        )
      )
    );
}</pre>
  </div>
  <div class="grid grid-cols-1 gap-2">
    <div class="comet-card !py-2 !px-3">
      <div class="title-blue !text-xs !mb-0.5">1. <code>debounceTime(300)</code> + <code>distinctUntilChanged()</code></div>
      <p class="text-xs m-0 text-[#3a372f]">Ждём паузу после ввода и не отправляем запрос повторно, если слово не изменилось.</p>
    </div>
    <div class="comet-card !py-2 !px-3">
      <div class="title-teal !text-xs !mb-0.5">2. <code>switchMap(query => ...)</code></div>
      <p class="text-xs m-0 text-[#3a372f]">Если пользователь допечатал букву, старый запрос тут же отменяется — на экране всегда актуальный ответ.</p>
    </div>
    <div class="comet-card !py-2 !px-3">
      <div class="title-green !text-xs !mb-0.5">3. <code>retry(1)</code> + <code>catchError</code> внутри</div>
      <p class="text-xs m-0 text-[#3a372f]">При случайном сбое сети пробуем ещё раз, а если сервер лежит — возвращаем <code>[]</code>, сохраняя поиск живым.</p>
    </div>
  </div>
</div>

---
transition: slide-up
---

<CatQuestLevel :level="12" />

---
transition: slide-left
---

<span class="comet-pill">ИТОГИ · ШПАРГАЛКА</span>
<h2>Шпаргалка: какая задача — какой оператор</h2>
<p class="comet-subtitle">Выберите задачу из списка или включите режим блиц-проверки.</p>

<OperatorMatrix />

---
class: comet-dark
transition: fade-out
---

<div class="flex items-center justify-between h-full gap-8">
  <div class="flex flex-col max-w-[62%]">
    <span class="comet-pill">ИТОГИ ЛЕКЦИИ</span>
    <h1 class="!text-[3.3rem] !leading-[1.08] mt-3 !mb-6">
      Интерфейс — это<br />события во времени
    </h1>
    <p class="comet-subtitle !text-[1.12rem] !mb-7 leading-relaxed">
      С RxJS не нужно вручную следить за таймерами и флагами: вы просто собираете цепочку из нескольких операторов, а отмену старых запросов и очистку подписок берёт на себя поток.
    </p>
    <div class="grid grid-cols-2 gap-3 text-xs font-mono">
      <a href="https://rxjs.dev/" target="_blank" class="comet-card comet-card--dark no-underline hover:border-[#4f98a3]">
        <div class="text-[#4f98a3] font-bold mb-1">Документация RxJS ↗</div>
        <div class="opacity-70">https://rxjs.dev/</div>
      </a>
      <a href="https://rxjs-course-avy.web.app/lessons" target="_blank" class="comet-card comet-card--dark no-underline hover:border-[#4f98a3]">
        <div class="text-[#6daa45] font-bold mb-1">Практика RxJS Ninja ↗</div>
        <div class="opacity-70">https://rxjs-course-avy.web.app/</div>
      </a>
    </div>
  </div>
  <div class="flex flex-col items-center gap-4 pr-6">
    <CometCat mood="success" :size="145" dark caption="Все 12 квизов и потоков собраны!" />
    <div class="font-mono text-xs text-[#9f9d96] bg-[#201f1d] border border-[#3a372f] px-4 py-2 rounded-full">
      событие &nbsp;→&nbsp; pipe() &nbsp;→&nbsp; состояние экрана
    </div>
  </div>
</div>
