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
  <div class="flex flex-col max-w-[60%]">
    <span class="comet-pill">ЛЕКЦИЯ И ПРАКТИКА · ПОЛНЫЙ КУРС</span>
    <h1 class="!text-[4.2rem] !leading-[1.02] mt-2 mb-3">RxJS</h1>
    <div class="text-[1.95rem] font-bold leading-tight mb-4">
      Реактивное программирование<br />для фронтенд-разработчиков
    </div>
    <p class="comet-subtitle !text-[1.12rem]">
      От базовой идеи потока до объединения источников, обработки ошибок, накопления состояния и создания своих операторов
    </p>
  </div>
  <div class="flex flex-col items-center gap-5 pr-6">
    <CometCat mood="idle" :size="135" dark caption="Помощник по потокам Кот Комет" />
    <div class="w-[270px]">
      <MarbleStream
        :interactive="false"
        compact
        :tracks="[
          {
            name: 'stream$',
            completeAt: 88,
            items: [
              { x: 18, label: 'a', color: 'teal' },
              { x: 44, label: 'b', color: 'blue' },
              { x: 70, label: 'c', color: 'orange' }
            ]
          }
        ]"
      />
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
<p class="comet-subtitle">Пользователь нажимает кнопки, печатает в поиске, сервер присылает ответ с задержкой, а таймер отсчитывает секунды.</p>

<MarbleStream
  :tracks="[
    {
      name: 'клики',
      items: [
        { x: 14, label: 'клик 1', color: 'teal', detail: 'Пользователь нажал кнопку в первый раз' },
        { x: 38, label: 'клик 2', color: 'teal', detail: 'Второе нажатие через пару секунд' },
        { x: 68, label: 'клик 3', color: 'teal', detail: 'Третье нажатие' }
      ]
    },
    {
      name: 'поле ввода',
      items: [
        { x: 20, label: 'r', color: 'blue', detail: 'Ввели первую букву r' },
        { x: 38, label: 'rx', color: 'blue', detail: 'Допечатали вторую букву — получилось rx' },
        { x: 54, label: 'rxjs', color: 'blue', detail: 'Допечатали слово rxjs целиком' }
      ]
    },
    {
      name: 'запрос HTTP',
      completeAt: 76,
      items: [
        { x: 64, label: 'ответ', color: 'green', detail: 'Сервер вернул данные, после чего запрос завершился (|)' }
      ]
    },
    {
      name: 'таймер',
      items: [
        { x: 14, label: '0', color: 'orange' },
        { x: 38, label: '1', color: 'orange' },
        { x: 64, label: '2', color: 'orange' },
        { x: 84, label: '3', color: 'orange' }
      ]
    }
  ]"
  :steps="[
    { x: 14, text: 'Первый клик по кнопке и первый отсчёт таймера.' },
    { x: 20, text: 'Пользователь начал печатать в строке поиска: символ r.' },
    { x: 38, text: 'Второй клик, продолжение ввода (rx) и следующий шаг таймера.' },
    { x: 54, text: 'Пользователь закончил печатать слово rxjs.' },
    { x: 64, text: 'Пришёл ответ от сервера (HTTP), и поток запроса сразу закрылся зелёной чертой (|).' },
    { x: 68, text: 'Ещё один клик по кнопке.' },
    { x: 84, text: 'Таймер продолжает идти дальше.' }
  ]"
/>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Почему привычных инструментов не всегда хватает</h2>
<p class="comet-subtitle">Когда на экране нужно связать ввод текста, таймер и отмену запросов, обычный код быстро запутывается.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card">
    <div class="title-red">Вложенные колбэки</div>
    <p class="text-sm text-[#3a372f] m-0">
      Когда одно действие зависит от другого, функции вкладываются друг в друга. Такой код тяжело читать, а отменить цепочку посередине почти невозможно.
    </p>
  </div>
  <div class="comet-card">
    <div class="title-orange">Promise</div>
    <p class="text-sm text-[#3a372f] m-0">
      Отлично подходит для одного запроса, но срабатывает только <strong>один раз</strong>. А в строке поиска или фильтре новые значения приходят снова и снова.
    </p>
  </div>
  <div class="comet-card">
    <div class="title-blue">Слушатели событий</div>
    <p class="text-sm text-[#3a372f] m-0">
      Каждый <code>addEventListener</code> живёт сам по себе. Чтобы добавить паузу, отсеять повторы и не забыть удалить слушатель, приходится заводить флаги и таймеры вручную.
    </p>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Что такое RxJS: работаем с событиями как с массивом</h2>
<p class="comet-subtitle">С массивами мы уже умеем работать через <code>filter</code> и <code>map</code>. RxJS даёт те же методы для событий во времени.</p>

<div class="comet-grid-2 mb-4">
  <div class="comet-card">
    <div class="title-blue">Обычный массив — все данные уже в памяти</div>
    <p class="text-sm text-[#6e6c65] mb-2">Берём готовый список чисел, отбираем нужные и умножаем:</p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">[1, 2, 3, 4]
  .filter(x =&gt; x &gt; 2)
  .map(x =&gt; x * 10);
// сразу получили [30, 40]</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal">Поток RxJS — данные приходят со временем</div>
    <p class="text-sm text-[#6e6c65] mb-2">Точно так же описываем шаги, но они срабатывают на каждое новое событие:</p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">clicks$.pipe(
  filter(x =&gt; x &gt; 2),
  map(x =&gt; x * 10)
);
// 30, 40 — по мере нажатий</pre>
  </div>
</div>

<div class="comet-card comet-card--green">
  <div class="font-mono text-xs uppercase tracking-wider text-[#01696f] font-bold mb-2">
    Пример из жизни · Поиск книг по мере ввода
  </div>
  <div class="grid grid-cols-4 gap-3 text-center text-sm font-semibold items-center">
    <div class="bg-white rounded-lg py-2 px-3 border border-[#dcdad2]">1. Ввод текста</div>
    <div class="bg-white rounded-lg py-2 px-3 border border-[#dcdad2]">2. Пауза 300 мс</div>
    <div class="bg-white rounded-lg py-2 px-3 border border-[#dcdad2]">3. Запрос на сервер</div>
    <div class="bg-[#d6eadf] text-[#437a22] rounded-lg py-2 px-3 border border-[#437a22]/30">4. Список на экране</div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Чем Observable отличается от Promise</h2>
<p class="comet-subtitle">Оба работают с асинхронным кодом, но решают разные задачи.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-orange">Promise — как заказ одной посылки</div>
    <ul class="text-sm space-y-2 pl-4 m-0">
      <li>возвращает только <strong>одно значение</strong> и завершается</li>
      <li>начинает выполняться <strong>сразу в момент создания</strong></li>
      <li>у самого <code>Promise</code> нет встроенного метода отмены</li>
    </ul>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs mt-3 mb-0">// Запрос уже ушёл, даже без .then()
const p = fetch('/api/user');</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal">Observable — как подписка на радиоволну</div>
    <ul class="text-sm space-y-2 pl-4 m-0">
      <li>может выдать <strong>одно, десять или бесконечно много</strong> значений</li>
      <li>начинает работать <strong>только когда на него подписались</strong></li>
      <li>подписку можно остановить в любой момент через <code>unsubscribe()</code></li>
    </ul>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs mt-3 mb-0">// Пока не вызвали subscribe, ничего не происходит
const sub = stream$.subscribe(render);
sub.unsubscribe(); // остановили</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ДОБРО ПОЖАЛОВАТЬ В RX</span>
<h2>Где потоки уже встроены в Angular</h2>
<p class="comet-subtitle">В Angular не нужно подключать RxJS отдельно — основные части фреймворка уже возвращают потоки.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card">
    <div class="title-teal">1. Запросы к серверу</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Сервис <code>HttpClient</code> возвращает поток. Это позволяет легко повторять упавшие запросы и отменять ненужные.
    </p>
    <div class="font-mono text-xs text-[#01696f] bg-[#e3ece8] px-2.5 py-1.5 rounded">
      this.http.get('/api/books')
    </div>
  </div>
  <div class="comet-card">
    <div class="title-blue">2. Адресная строка (Router)</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Когда пользователь переходит между товарами, роутер присылает новый <code>id</code> в поток без перезагрузки компонента.
    </p>
    <div class="font-mono text-xs text-[#006494] bg-[#e5eef5] px-2.5 py-1.5 rounded">
      route.paramMap, route.queryParams
    </div>
  </div>
  <div class="comet-card">
    <div class="title-orange">3. Формы и события DOM</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Каждое изменение поля ввода или статуса валидации формы приходит как новое значение в потоке.
    </p>
    <div class="font-mono text-xs text-[#da7101] bg-[#f7ebd9] px-2.5 py-1.5 rounded">
      control.valueChanges, fromEvent()
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
<p class="comet-subtitle">Обычный (холодный) Observable ведёт себя как функция: пока её не вызвали, код внутри не выполняется.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card comet-card--code flex flex-col justify-center">
    <span class="comet-pill mb-2">ОБЪЯВЛЕНИЕ И ЗАПУСК</span>
    <div class="font-mono text-sm leading-relaxed">
      <div>const stream$ = of(1, 2, 3);</div>
      <div class="text-[#6e6c65]">// 1. Просто описали поток — ничего не происходит</div>
      <div class="mt-3">stream$.subscribe(v => console.log(v));</div>
      <div class="text-[#01696f] font-bold">// 2. Подписались — в консоль вывелось: 1, 2, 3</div>
    </div>
  </div>
  <div class="flex flex-col gap-3">
    <div class="comet-card">
      <div class="title-teal">Каждая подписка запускает работу заново</div>
      <p class="text-sm m-0">
        Если подписаться на <code>http.get('/api/users')</code> в двух местах, уйдёт <strong>два отдельных сетевых запроса</strong> — как при двух вызовах обычной функции.
      </p>
    </div>
    <div class="comet-card">
      <div class="title-orange">Осторожно с готовым Promise</div>
      <p class="text-sm m-0">
        Если передать в <code>from(fetch('/api'))</code> уже созданный промис, запрос уйдёт сразу, потому что <code>fetch()</code> вызвался ещё до <code>from()</code>.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2>Три сигнала потока: <code>next</code>, <code>error</code> и <code>complete</code></h2>
<p class="comet-subtitle">Во время работы поток может присылать данные, а в конце — либо успешно завершиться, либо сообщить об ошибке.</p>

<div class="comet-grid-3 mb-4">
  <div class="comet-card">
    <div class="title-teal"><code>next(value)</code></div>
    <p class="text-sm m-0 text-[#3a372f]">
      Пришло новое значение. За время жизни потока может вызваться сколько угодно раз (или ни разу).
    </p>
  </div>
  <div class="comet-card">
    <div class="title-green"><code>complete()</code></div>
    <p class="text-sm m-0 text-[#3a372f]">
      Поток успешно закончил работу (зелёная черта <code>|</code> на схеме). Новых значений больше не будет.
    </p>
  </div>
  <div class="comet-card">
    <div class="title-red"><code>error(err)</code></div>
    <p class="text-sm m-0 text-[#3a372f]">
      Произошла ошибка (значок <code>✕</code>). Поток сразу закрывается, и после ошибки данные уже не придут.
    </p>
  </div>
</div>

<div class="comet-grid-2 items-center">
  <MarbleStream
    compact
    :tracks="[
      {
        name: 'успех',
        completeAt: 82,
        items: [
          { x: 20, label: '10', color: 'teal', detail: 'next(10) — первое значение' },
          { x: 48, label: '20', color: 'teal', detail: 'next(20) — второе значение' },
          { x: 72, label: '30', color: 'teal', detail: 'next(30), а следом complete() |' }
        ]
      },
      {
        name: 'ошибка',
        errorAt: 64,
        items: [
          { x: 20, label: '10', color: 'teal', detail: 'next(10) — успело прийти до сбоя' },
          { x: 64, label: '500', kind: 'error', detail: 'error() — поток аварийно закрылся, дальше значений нет' }
        ]
      }
    ]"
    :steps="[
      { x: 20, text: 'Оба потока начали работу и выдали первое значение next(10).' },
      { x: 48, text: 'Первый поток продолжает работать и выдаёт next(20).' },
      { x: 64, text: 'Во втором потоке произошла ошибка (✕) — он сразу прекращает работу.' },
      { x: 72, text: 'Первый поток выдаёт последнее значение next(30) и успешно закрывается (|).' }
    ]"
  />
  <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">stream$.subscribe({
  next: value =&gt; console.log('Данные:', value),
  error: err =&gt; console.error('Ошибка:', err),
  complete: () =&gt; console.log('Поток завершён')
});</pre>
</div>

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2><code>Subject</code> и <code>BehaviorSubject</code></h2>
<p class="comet-subtitle">Когда нам нужно самим отправлять новые значения в поток с помощью метода <code>.next()</code>.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-blue"><code>Subject</code> — только будущие события</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Работает как прямое объявление по громкоговорителю: кто был в комнате в момент вызова <code>next()</code>, тот услышал. Кто подписался позже — прошлые события не получит.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">const submit$ = new Subject&lt;void&gt;();
submit$.next(); // никто ещё не подписан — ушло в пустоту
submit$.subscribe(() =&gt; sendForm());
submit$.next(); // сработает!</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal"><code>BehaviorSubject</code> — хранит текущее значение</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Требует начальное значение при создании и всегда помнит последнее. Любой новый подписчик <strong>сразу же</strong> получает текущее состояние.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">const page$ = new BehaviorSubject&lt;number&gt;(1);
// Подписались позже — но сразу получили 1:
page$.subscribe(p =&gt; console.log('Страница:', p));
page$.next(2); // теперь все получат 2</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">БАЗОВЫЕ ЭЛЕМЕНТЫ</span>
<h2>Подписка — это ресурс, который нужно закрывать</h2>
<p class="comet-subtitle">Если компонент удалился с экрана, а бесконечный поток продолжает работать, возникает утечка памяти.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    :tracks="[
      {
        name: 'компонент',
        items: [
          { x: 14, label: 'открыт', color: 'teal', detail: 'Компонент появился на экране и подписался на таймер' },
          { x: 64, label: 'удалён', color: 'red', detail: 'Пользователь ушёл со страницы — вызываем unsubscribe()' }
        ]
      },
      {
        name: 'без отписки',
        items: [
          { x: 22, label: '1', color: 'teal' },
          { x: 42, label: '2', color: 'teal' },
          { x: 64, label: '3', color: 'orange', detail: 'Компонента уже нет, а таймер всё ещё крутится в памяти!' },
          { x: 84, label: '4 (утечка)', color: 'red', detail: 'Лишняя нагрузка и ошибки при обращении к удалённому экрану' }
        ]
      },
      {
        name: 'с отпиской',
        items: [
          { x: 22, label: '1', color: 'green' },
          { x: 42, label: '2', color: 'green' },
          { x: 64, label: 'стоп', kind: 'cancel', detail: 'unsubscribe() остановил поток вместе с удалением компонента' }
        ]
      }
    ]"
    :steps="[
      { x: 14, text: 'Компонент открылся и запустил подписку на интервал.' },
      { x: 22, text: 'Пришло первое значение — всё работает штатно.' },
      { x: 42, text: 'Пришло второе значение.' },
      { x: 64, text: 'Пользователь закрыл страницу: с отпиской поток останавливается (✕), а без отписки продолжает жить.' },
      { x: 84, text: 'Забытая подписка продолжает тратить память в фоне после ухода со страницы.' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <div class="comet-card comet-card--code">
      <pre v-pre class="m-0 text-xs">const sub = interval(1000).subscribe(render);
// При уходе со страницы:
sub.unsubscribe();</pre>
    </div>
    <div class="comet-card">
      <div class="title-teal !text-sm">Как мы делаем это в Angular</div>
      <p class="text-xs text-[#3a372f] m-0">
        Вместо ручного вызова <code>unsubscribe()</code> мы используем пайп <code>| async</code> в шаблоне или оператор <code>takeUntilDestroyed()</code> — они отписываются сами.
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
<h2><code>of([1, 2, 3])</code> и <code>from([1, 2, 3])</code> — в чём разница</h2>
<p class="comet-subtitle">Передаём один и тот же массив, но получаем совершенно разное поведение потока.</p>

<div class="comet-grid-2 mb-4">
  <div class="comet-card">
    <div class="title-orange"><code>of([1, 2, 3])</code> — массив целиком за один раз</div>
    <p class="text-sm text-[#3a372f] mb-2">
      Передаёт аргумент как есть, не заглядывая внутрь. Подписчик получит один вызов <code>next([1, 2, 3])</code>.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded text-xs m-0">of([1, 2, 3]).subscribe(v =&gt; console.log(v));
// выведет один раз: [1, 2, 3]</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal"><code>from([1, 2, 3])</code> — элементы по одному</div>
    <p class="text-sm text-[#3a372f] mb-2">
      Достаёт элементы из массива по очереди и отправляет каждый отдельным вызовом <code>next()</code>. Также умеет превращать <code>Promise</code> в поток.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded text-xs m-0">from([1, 2, 3]).subscribe(v =&gt; console.log(v));
// выведет три раза: 1, затем 2, затем 3</pre>
  </div>
</div>

<MarbleStream
  compact
  :tracks="[
    {
      name: 'of([1,2,3])',
      completeAt: 50,
      items: [
        { x: 24, label: '[1, 2, 3]', color: 'orange', detail: 'Весь массив пришёл одним значением' }
      ]
    },
    {
      name: 'from([1,2,3])',
      completeAt: 84,
      items: [
        { x: 24, label: '1', color: 'teal', detail: 'Первый элемент массива (1)' },
        { x: 48, label: '2', color: 'teal', detail: 'Второй элемент массива (2)' },
        { x: 72, label: '3', color: 'teal', detail: 'Третий элемент массива (3)' }
      ]
    }
  ]"
  :steps="[
    { x: 24, text: 'of() сразу отдал весь массив [1, 2, 3] целиком, а from() выдал только первый элемент 1.' },
    { x: 48, text: 'Поток of() уже завершился, а from() выдаёт второй элемент 2.' },
    { x: 72, text: 'from() выдаёт третий элемент 3 и после этого завершается (|).' }
  ]"
/>

---
transition: slide-left
---

<span class="comet-pill">ОПЕРАТОРЫ СОЗДАНИЯ</span>
<h2><code>defer()</code>, <code>EMPTY</code> и <code>throwError()</code></h2>
<p class="comet-subtitle">Как вычислять данные в момент подписки, возвращать пустой поток и передавать ошибки.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal"><code>defer(() => ...)</code> — свежий расчёт при подписке</div>
      <p class="text-sm text-[#3a372f]">
        Если написать <code>of(Date.now())</code>, время зафиксируется один раз при загрузке файла. А <code>defer</code> вызывает функцию заново для каждого нового подписчика.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">let count = 0;
const req$ = defer(() =&gt; of(++count));
req$.subscribe(console.log); // 1
req$.subscribe(console.log); // 2
// Делает ленивым запуск fetch():
const users$ = defer(() =&gt; from(fetch('/api/users')));</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-red"><code>EMPTY</code> и <code>throwError(() => err)</code></div>
      <p class="text-sm text-[#3a372f]">
        <code>EMPTY</code> мгновенно закрывается через <code>complete()</code> без значений. А <code>throwError</code> сразу переходит в ветку <code>error</code>.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">this.http.get('/api/profile').pipe(
  catchError(err =&gt; {
    console.error('Ошибка загрузки', err);
    // Либо пробросить ошибку: return throwError(() =&gt; err);
    // Либо тихо завершить:
    return EMPTY;
  })
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОПЕРАТОРЫ СОЗДАНИЯ</span>
<h2>Таймеры <code>timer()</code>, <code>interval()</code> и <code>take(N)</code></h2>
<p class="comet-subtitle"><code>timer(ms)</code> выдаёт одно значение после паузы, а <code>interval(ms)</code> тикает бесконечно, пока его не остановит <code>take(N)</code>.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    pipeline
    :tracks="[
      {
        name: 'interval(1000)',
        items: [
          { x: 16, label: '0', color: 'teal' },
          { x: 36, label: '1', color: 'teal' },
          { x: 56, label: '2', color: 'teal' },
          { x: 78, label: '3', color: 'gray' }
        ]
      },
      {
        name: 'take(3)',
        completeAt: 64,
        items: [
          { x: 16, label: '0', color: 'green' },
          { x: 36, label: '1', color: 'green' },
          { x: 56, label: '2', color: 'green' },
          { x: 78, label: '3', kind: 'filtered' }
        ]
      }
    ]"
    :steps="[
      { x: 16, text: 'Прошла 1 секунда: interval выдал 0. Оператор take(3) пропустил первое значение (1 из 3).' },
      { x: 36, text: 'Прошла 2-я секунда: interval выдал 1. take(3) пропустил второе значение (2 из 3).' },
      { x: 56, text: 'Прошла 3-я секунда: interval выдал 2. take(3) получил третье значение и сразу закрыл поток (|).' },
      { x: 78, text: 'Таймер уже отключён — следующие значения больше не идут, утечки памяти нет.' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">// Одно значение 0 через 500 мс и complete:
timer(500).subscribe(console.log);
// Повторяющийся счётчик на 3 шага:
interval(1000).pipe(
  take(3)
).subscribe(v =&gt; console.log('Шаг:', v));</pre>
    <div class="comet-card">
      <div class="title-green !text-sm">Зачем нужен <code>take(3)</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        Сам по себе <code>interval(1000)</code> работает бесконечно. Оператор <code>take(3)</code> отсчитывает ровно 3 значения, вызывает <code>complete()</code> и сам останавливает таймер.
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
<p class="comet-subtitle !text-[1.2rem]">Как данные проходят через цепочку операторов шаг за шагом</p>

<SectionStepper :total="11" :active="4" />

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2>Как работает <code>pipe()</code>: разбор по шагам</h2>
<p class="comet-subtitle">Каждое значение из источника проходит сверху вниз через все операторы по очереди. Нажмите <strong>«Показать по шагам»</strong>:</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    pipeline
    :tracks="[
      {
        name: 'вход: of(1..5)',
        items: [
          { x: 14, label: '1', color: 'teal' },
          { x: 31, label: '2', color: 'teal' },
          { x: 49, label: '3', color: 'teal' },
          { x: 67, label: '4', color: 'teal' },
          { x: 84, label: '5', color: 'teal' }
        ]
      },
      {
        name: 'filter(x > 2)',
        items: [
          { x: 14, label: '1', kind: 'filtered', detail: '1 > 2 — ложь, фильтр не пропускает единицу дальше' },
          { x: 31, label: '2', kind: 'filtered', detail: '2 > 2 — ложь, двойка тоже останавливается здесь' },
          { x: 49, label: '3', color: 'blue', detail: '3 > 2 — истина! Число 3 идёт в следующий оператор' },
          { x: 67, label: '4', color: 'blue', detail: '4 > 2 — истина! Число 4 проходит дальше' },
          { x: 84, label: '5', color: 'blue', detail: '5 > 2 — истина! Число 5 проходит дальше' }
        ]
      },
      {
        name: 'map(x * 10)',
        completeAt: 92,
        items: [
          { x: 49, label: '30', color: 'green', detail: '3 * 10 = 30 — попадает в subscribe()' },
          { x: 67, label: '40', color: 'green', detail: '4 * 10 = 40 — попадает в subscribe()' },
          { x: 84, label: '50', color: 'green', detail: '5 * 10 = 50 — попадает в subscribe()' }
        ]
      }
    ]"
    :steps="[
      { x: 14, text: 'В поток приходит 1 → проверяем filter(x > 2): условие ложно (1 ✕), поэтому до map() единица даже не доходит.' },
      { x: 31, text: 'Приходит 2 → проверяем filter(x > 2): снова ложно (2 ✕), дальше значение не идёт.' },
      { x: 49, text: 'Приходит 3 → проходит фильтр (3 > 2) → спускается в map(x * 10) → на выходе получаем 30.' },
      { x: 67, text: 'Приходит 4 → проходит фильтр → в map умножается на 10 → на выходе получаем 40.' },
      { x: 84, text: 'Приходит 5 → проходит фильтр → в map превращается в 50, и поток завершается (|).' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">of(1, 2, 3, 4, 5).pipe(
  filter(x =&gt; x &gt; 2),
  map(x =&gt; x * 10)
).subscribe(result =&gt; {
  console.log(result);
  // 30, 40, 50
});</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm">Почему порядок операторов важен</div>
      <p class="text-xs text-[#3a372f] m-0">
        Ставьте <code>filter</code> <strong>перед</strong> <code>map</code>: тогда отброшенные значения (<code>1</code> и <code>2</code>) не будут зря вычисляться в следующих операторах.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>map()</code> и <code>tap()</code> — в чём отличие</h2>
<p class="comet-subtitle">Один оператор преобразует данные для экрана, а второй позволяет просто подсмотреть за потоком со стороны.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-teal"><code>map(fn)</code> — меняет значение в потоке</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Берёт входное значение, возвращает новое и передаёт его дальше по цепочке. Например, превращает ответ сервера в удобный для шаблона объект.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">http.get&lt;UserDto&gt;('/api/user').pipe(
  map(dto =&gt; ({
    id: dto.id,
    fullName: `${dto.firstName} ${dto.lastName}`
  }))
);</pre>
  </div>
  <div class="comet-card">
    <div class="title-orange"><code>tap(fn)</code> — посмотреть, не меняя</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Полезен для отладки (<code>console.log</code>) или записи метрик. Что бы вы ни вернули внутри <code>tap</code>, дальше по потоку пойдёт исходное значение.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">of(1, 2, 3).pipe(
  tap(x =&gt; console.log('До умножения:', x)),
  map(x =&gt; x * 10),
  tap(x =&gt; console.log('После умножения:', x))
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>startWith()</code> — начальное значение сразу при подписке</h2>
<p class="comet-subtitle">Помогает сразу задать стартовое состояние экрана, пока запрос к серверу ещё выполняется.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    pipeline
    :tracks="[
      {
        name: 'запрос API',
        completeAt: 84,
        items: [
          { x: 66, label: 'книги', color: 'teal', detail: 'Ответ сервера пришёл через некоторое время' }
        ]
      },
      {
        name: 'startWith([])',
        completeAt: 84,
        items: [
          { x: 18, label: '[] (старт)', color: 'green', detail: 'Выдаётся мгновенно в момент вызова subscribe()' },
          { x: 66, label: 'книги', color: 'green', detail: 'Затем приходит настоящий список с сервера' }
        ]
      }
    ]"
    :steps="[
      { x: 18, text: 'Подписались на поток: сервер ещё думает, но startWith([]) сразу отдаёт пустой список.' },
      { x: 66, text: 'Пришёл ответ от сервера — экран обновляется настоящим списком книг.' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">this.api.getBooks().pipe(
  startWith([])
).subscribe(books =&gt; {
  this.books = books;
});</pre>
    <div class="comet-card">
      <div class="title-green !text-sm">Зачем он нужен</div>
      <p class="text-xs text-[#3a372f] m-0">
        Без <code>startWith</code> поток молчит до первого события. С ним шаблон сразу получает начальные данные или статус <code>'loading'</code>.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>distinctUntilChanged()</code> — убираем повторы подряд</h2>
<p class="comet-subtitle">Сравнивает новое значение с предыдущим (<code>===</code>). Если пришло то же самое подряд — пропускает ход.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    pipeline
    :tracks="[
      {
        name: 'вход',
        items: [
          { x: 16, label: 'a', color: 'teal' },
          { x: 34, label: 'a', color: 'teal' },
          { x: 52, label: 'b', color: 'blue' },
          { x: 70, label: 'b', color: 'blue' },
          { x: 86, label: 'a', color: 'teal' }
        ]
      },
      {
        name: 'без повторов',
        completeAt: 92,
        items: [
          { x: 16, label: 'a', color: 'green', detail: 'Первое значение a — пропускаем' },
          { x: 34, label: 'a', kind: 'filtered', detail: 'Снова a подряд — отсеиваем дубликат' },
          { x: 52, label: 'b', color: 'green', detail: 'Новое значение b — пропускаем' },
          { x: 70, label: 'b', kind: 'filtered', detail: 'Снова b подряд — отсеиваем дубликат' },
          { x: 86, label: 'a', color: 'green', detail: 'Перед ним было b, поэтому новое a снова проходит!' }
        ]
      }
    ]"
    :steps="[
      { x: 16, text: 'Приходит первая буква a — пропускаем дальше.' },
      { x: 34, text: 'Снова приходит a подряд — distinctUntilChanged отсеивает повтор (a ✕).' },
      { x: 52, text: 'Приходит b — значение изменилось, пропускаем дальше.' },
      { x: 70, text: 'Второй раз подряд приходит b — отсеиваем дубликат (b ✕).' },
      { x: 86, text: 'Снова приходит a — перед ним было b, поэтому это не повтор подряд, значение проходит!' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">from(['a', 'a', 'b', 'b', 'a']).pipe(
  distinctUntilChanged()
).subscribe(console.log);
// Выведет: 'a', 'b', 'a'</pre>
    <div class="comet-card">
      <div class="title-blue !text-sm">Как сравнивать объекты</div>
      <p class="text-xs text-[#3a372f] m-0">
        По умолчанию значения сравниваются через <code>===</code>. Для объектов можно передать свою проверку: <code>distinctUntilChanged((a, b) => a.id === b.id)</code>.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ЦЕПОЧКА PIPE И ОПЕРАТОРЫ</span>
<h2><code>debounceTime(300)</code> — ждём паузу при вводе</h2>
<p class="comet-subtitle">Чтобы не отправлять запрос на каждую букву, подождём 300 мс тишины после последнего нажатия клавиши.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    pipeline
    :tracks="[
      {
        name: 'печатаем',
        items: [
          { x: 14, label: 'r', color: 'teal' },
          { x: 28, label: 'rx', color: 'teal' },
          { x: 42, label: 'rxjs', color: 'teal' },
          { x: 76, label: 'rxjs 8', color: 'teal' }
        ]
      },
      {
        name: 'таймер 300 мс',
        items: [
          { x: 14, label: 'r', kind: 'filtered', detail: 'Не успело пройти 300 мс — пользователь нажал следующую клавишу' },
          { x: 28, label: 'rx', kind: 'filtered', detail: 'Таймер снова сбросился из-за новой буквы' },
          { x: 58, label: 'rxjs', color: 'green', detail: 'После ввода rxjs прошло 300 мс тишины — отправляем запрос!' },
          { x: 88, label: 'rxjs 8', color: 'green', detail: 'После второй паузы отправляем обновлённый запрос' }
        ]
      }
    ]"
    :steps="[
      { x: 14, text: 'Набрали r — запустился таймер на 300 мс.' },
      { x: 28, text: 'Быстро допечатали rx — старый таймер сбросился (r ✕), отсчёт 300 мс начался заново.' },
      { x: 42, text: 'Быстро допечатали rxjs — таймер снова перезапустился (rx ✕).' },
      { x: 58, text: 'Пользователь сделал паузу 300 мс — таймер сработал и пропустил итоговое слово rxjs!' },
      { x: 76, text: 'Позже допечатали rxjs 8 — снова ждём паузу.' },
      { x: 88, text: 'Прошло ещё 300 мс тишины — на выход ушло rxjs 8.' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(text =&gt; {
  this.loadBooks(text);
});</pre>
    <div class="comet-card">
      <div class="title-orange !text-sm">Как это работает простыми словами</div>
      <p class="text-xs text-[#3a372f] m-0">
        Каждое новое нажатие клавиши сбрасывает секундомер на ноль. Значение проходит дальше только тогда, когда пользователь перестал печатать на 300 миллисекунд.
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
<h2>Когда одно событие запускает другой поток</h2>
<p class="comet-subtitle">Пользователь вводит текст или кликает по кнопке — и на каждое событие мы вызываем <code>http.get()</code> или <code>http.post()</code>.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-red">В чём возникает проблема</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Запрос к серверу занимает время. Пока идёт первый запрос, пользователь может ввести новую букву или нажать кнопку ещё раз.
    </p>
    <p class="text-sm text-[#3a372f] m-0">
      Если никак этим не управлять, ответы от сервера придут вперемешку или заказ создастся дважды.
    </p>
  </div>
  <div class="comet-card flex flex-col justify-center gap-2.5">
    <div class="title-teal">Четыре правила выбора оператора</div>
    <div class="p-2 rounded bg-[#e3ece8] text-xs font-semibold">
      1. <code>switchMap</code> — <strong>отменить старый</strong> и слушать только последний (поиск, вкладки)
    </div>
    <div class="p-2 rounded bg-[#e5eef5] text-xs font-semibold">
      2. <code>mergeMap</code> — <strong>запустить параллельно</strong>, порядок не важен (загрузка по ID)
    </div>
    <div class="p-2 rounded bg-[#f7ebd9] text-xs font-semibold">
      3. <code>concatMap</code> — <strong>поставить в очередь</strong>, важен строгий порядок (сохранения)
    </div>
    <div class="p-2 rounded bg-[#e2ede6] text-xs font-semibold">
      4. <code>exhaustMap</code> — <strong>игнорировать новые</strong>, пока текущий занят (кнопка входа/оплаты)
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ПОТОКИ ВНУТРИ ПОТОКОВ · СРАВНЕНИЕ</span>
<h2>Разберите все 4 оператора по шагам</h2>

<HigherOrderExplorer />

---
transition: slide-left
---

<span class="comet-pill">ПОТОКИ ВНУТРИ ПОТОКОВ · ПАРАЛЛЕЛЬНОСТЬ С ЛИМИТОМ</span>
<h2>Ограничение параллельности: <code>mergeMap(fn, N)</code></h2>
<p class="comet-subtitle">Загружать 100 файлов одновременно — тяжело для браузера, а по одному — слишком долго. Второй аргумент <code>mergeMap</code> задаёт лимит активных потоков.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    :tracks="[
      {
        name: 'слот 1',
        completeAt: 84,
        items: [
          { x: 14, label: 'файл A (60мс)', color: 'blue', detail: 'Стартовал сразу в первом слоте и грузится долго' },
          { x: 78, label: 'A готов', color: 'green' }
        ]
      },
      {
        name: 'слот 2',
        completeAt: 72,
        items: [
          { x: 14, label: 'B', color: 'teal', detail: 'Стартовал во втором слоте и быстро завершился' },
          { x: 38, label: 'C', color: 'orange', detail: 'Сразу занял освободившийся второй слот' },
          { x: 60, label: 'D', color: 'green', detail: 'Занял слот после завершения C' }
        ]
      },
      {
        name: 'выход',
        completeAt: 88,
        items: [
          { x: 28, label: 'B', color: 'teal' },
          { x: 50, label: 'C', color: 'orange' },
          { x: 68, label: 'D', color: 'green' },
          { x: 78, label: 'A', color: 'blue' }
        ]
      }
    ]"
    :steps="[
      { x: 14, text: 'При лимите 2 одновременно стартуют только файлы A и B. Файлы C и D ждут свободного слота.' },
      { x: 28, text: 'Быстрый файл B загрузился первым — во втором слоте тут же стартует файл C.' },
      { x: 50, text: 'Файл C загрузился — на его место сразу встаёт файл D.' },
      { x: 68, text: 'Файл D готов, а в первом слоте всё ещё докачивается большой файл A.' },
      { x: 78, text: 'Большой файл A завершился последним. В каждый момент шло не более 2 загрузок!' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">function uploadFiles$(files: File[]) {
  return from(files).pipe(
    // Второй аргумент 2 — максимум 2 загрузки сразу:
    mergeMap(file =&gt; uploadFile(file), 2)
  );
}</pre>
    <div class="comet-card">
      <div class="title-blue !text-sm">Бонус: <code>concatMap</code> — это <code>mergeMap(fn, 1)</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        Если передать лимит <code>1</code>, потоки будут выполняться строго по одному в очереди — именно так внутри и устроен <code>concatMap</code>.
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
<h2><code>merge()</code> и <code>concat()</code> — слияние или строгая очередь</h2>
<p class="comet-subtitle">Когда нужно объединить два готовых потока в один общий поток значений.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-blue"><code>merge(a$, b$)</code> — всё по мере прихода</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Подписывается на оба источника сразу. Чьё событие случилось раньше — то сразу и проходит дальше.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">// Слушаем клики кнопки и нажатие клавиши Enter вместе:
const submit$ = merge(buttonClicks$, enterKey$);</pre>
  </div>
  <div class="comet-card">
    <div class="title-orange"><code>concat(cache$, server$)</code> — строго по очереди</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Сначала слушает только первый поток. Когда он завершится (<code>complete</code>), подписывается на второй. Идеально для сценария «сначала кеш, потом сервер».
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">const cache$ = of('Данные из кеша');
const server$ = this.http.get('/api/fresh');
// Сначала мгновенно кеш, затем ответ сервера:
const data$ = concat(cache$, server$);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОБЪЕДИНЕНИЕ ПОТОКОВ</span>
<h2><code>combineLatest()</code> — когда все источники равны</h2>
<p class="comet-subtitle">Ждёт хотя бы по одному значению от каждого потока, а затем срабатывает при изменении любого из них.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    :tracks="[
      { name: 'фильтр$', items: [{ x: 12, label: 'книги', color: 'teal' }, { x: 54, label: 'игры', color: 'teal' }] },
      { name: 'страница$', items: [{ x: 26, label: 'стр 1', color: 'blue' }, { x: 82, label: 'стр 2', color: 'blue' }] },
      { name: 'результат', items: [{ x: 26, label: 'книги, 1', color: 'green' }, { x: 54, label: 'игры, 1', color: 'green' }, { x: 82, label: 'игры, 2', color: 'green' }] }
    ]"
    :steps="[
      { x: 12, text: 'Фильтр выдал «книги», но страница$ ещё молчит — combineLatest ждёт второй поток.' },
      { x: 26, text: 'Страница выдала «стр 1» — оба потока дали значения, получаем первую пару [книги, 1].' },
      { x: 54, text: 'Пользователь сменил фильтр на «игры» — сразу получаем обновлённую пару [игры, 1].' },
      { x: 82, text: 'Перешли на «стр 2» — получаем пару [игры, 2].' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">const filters$ = combineLatest([
  searchControl.valueChanges.pipe(startWith('')),
  categoryControl.valueChanges.pipe(startWith('all'))
]);</pre>
    <div class="comet-card">
      <div class="title-orange !text-sm">Не забывайте про <code>startWith()</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        Если пользователь ещё не трогал поле формы, <code>valueChanges</code> молчит. Добавьте <code>startWith('')</code>, чтобы список загрузился сразу при открытии экрана.
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
<h2><code>withLatestFrom()</code> — главное событие + фоновое состояние</h2>
<p class="comet-subtitle">Когда нужно срабатывать <strong>только от главного потока</strong> (например, клика), подглядывая в текущее значение второго потока.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    :tracks="[
      { name: 'saveClick$', items: [{ x: 40, label: 'клик 1', color: 'teal' }, { x: 80, label: 'клик 2', color: 'teal' }] },
      { name: 'role$', items: [{ x: 14, label: 'user', color: 'blue' }, { x: 60, label: 'admin', color: 'orange', detail: 'Роль сменилась в фоне, но без клика сохранение НЕ вызывается' }] },
      { name: 'результат', items: [{ x: 40, label: 'Save: user', color: 'green' }, { x: 80, label: 'Save: admin', color: 'green' }] }
    ]"
    :steps="[
      { x: 14, text: 'В потоке role$ установлено значение «user». На выходе тишина — клика ещё не было.' },
      { x: 40, text: 'Пользователь нажал «Сохранить» (клик 1) — берём текущую роль и получаем «Save: user».' },
      { x: 60, text: 'Роль в фоне сменилась на «admin» — в отличие от combineLatest, здесь ничего не запускается!' },
      { x: 80, text: 'Пользователь нажал «Сохранить» (клик 2) — теперь сохраняем с новой ролью «Save: admin».' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">const result$ = saveClick$.pipe(
  withLatestFrom(role$),
  map(([click, role]) =&gt; `Save as ${role}`)
);</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm"><code>combineLatest</code> vs <code>withLatestFrom</code></div>
      <p class="text-xs text-[#3a372f] m-0">
        В <code>combineLatest</code> все источники равны (любое изменение запускает код). В <code>withLatestFrom</code> команду даёт только главный поток.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОБЪЕДИНЕНИЕ ПОТОКОВ</span>
<h2><code>forkJoin()</code> — дождаться завершения всех задач</h2>
<p class="comet-subtitle">Аналог <code>Promise.all</code> для конечных потоков: запускает запросы параллельно и выдаёт один общий ответ в самом конце.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    :tracks="[
      { name: 'user$', completeAt: 42, items: [{ x: 34, label: 'профиль', color: 'blue' }] },
      { name: 'roles$', completeAt: 72, items: [{ x: 64, label: 'права', color: 'orange' }] },
      { name: 'результат', completeAt: 84, items: [{ x: 72, label: '{профиль, права}', color: 'green' }] }
    ]"
    :steps="[
      { x: 34, text: 'Запрос user$ вернул профиль и завершился (|), но roles$ ещё выполняется.' },
      { x: 64, text: 'Запрос roles$ вернул список прав доступа.' },
      { x: 72, text: 'Оба запроса завершились (|) — forkJoin отдаёт единый объект с обоими ответами.' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">forkJoin({
  user: this.http.get('/api/user'),
  roles: this.http.get('/api/roles')
}).subscribe(({ user, roles }) =&gt; {
  this.initScreen(user, roles);
});</pre>
    <div class="comet-card">
      <div class="title-red !text-sm">Не передавайте бесконечные потоки</div>
      <p class="text-xs text-[#3a372f] m-0">
        <code>forkJoin</code> ждёт сигнала <code>complete()</code> от каждого потока. Если передать туда бесконечный <code>interval()</code> или <code>valueChanges</code>, ответа не будет никогда.
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
<p class="comet-subtitle !text-[1.2rem]">catchError внутри switchMap, повторные попытки retry и гарантированная уборка в finalize</p>

<SectionStepper :total="11" :active="7" />

---
transition: slide-left
---

<span class="comet-pill">ОШИБКИ И ЗАВЕРШЕНИЕ</span>
<h2>Почему важно ставить <code>catchError</code> внутри <code>switchMap</code></h2>
<p class="comet-subtitle">Любая ошибка завершает тот поток, в котором её поймали. Если поймать ошибку снаружи <code>switchMap</code>, поле поиска перестанет работать навсегда.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-red">Плохо: <code>catchError</code> снаружи — убивает поиск</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Ошибка из <code>http.get</code> вылетает во внешний поток <code>query$</code> и завершает его. На следующий ввод пользователя поиск уже не среагирует:
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">query$.pipe(
  switchMap(q =&gt; this.http.get(`/api?q=${q}`)),
  // После первой ошибки весь query$ закрыт!
  catchError(() =&gt; of([]))
)</pre>
  </div>
  <div class="comet-card">
    <div class="title-green">Хорошо: <code>catchError</code> внутри — гасит только сбой запроса</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Ошибка перехватывается внутри маленького потока <code>http.get</code> и превращается в запасной массив <code>of([])</code>. Внешний поток <code>query$</code> продолжает жить:
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">query$.pipe(
  switchMap(q =&gt;
    this.http.get(`/api?q=${q}`).pipe(
      catchError(() =&gt; of([])) // внешний поток жив!
    )
  )
)</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ОШИБКИ И ЗАВЕРШЕНИЕ</span>
<h2><code>retry()</code> и <code>finalize()</code> — повтор при сбое и уборка</h2>
<p class="comet-subtitle">Как дать сети второй шанс перед показом ошибки и гарантированно выключить спиннер загрузки.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-orange"><code>retry(N)</code> — переподписка при ошибке</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Если источник упал с ошибкой, <code>retry(2)</code> не пропускает ошибку дальше, а заново подписывается на источник до 2 раз. Ставится <strong>перед</strong> <code>catchError</code>.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">this.http.get('/api/data').pipe(
  retry(2), // до 2 повторов при сбое
  catchError(() =&gt; of('Запасные данные'))
);</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal"><code>finalize(fn)</code> — выполнится при любом исходе</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Срабатывает при успешном завершении (<code>complete</code>), при ошибке (<code>error</code>) и даже при ручной отписке (<code>unsubscribe</code>).
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">this.loading = true;
this.http.get('/api/data').pipe(
  finalize(() =&gt; {
    this.loading = false; // уберёт спиннер всегда
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
<h1 class="!text-[3.2rem] mt-2">Разновидности Subject и кеш</h1>
<p class="comet-subtitle !text-[1.2rem]">Subject, BehaviorSubject, ReplaySubject, share и shareReplay</p>

<SectionStepper :total="11" :active="8" />

---
transition: slide-left
---

<span class="comet-pill">SUBJECT И МНОГОАДРЕСНЫЕ ПОТОКИ</span>
<h2>Три вида Subject: сколько значений они помнят</h2>
<p class="comet-subtitle">Все три раздают события нескольким подписчикам одновременно, но по-разному встречают тех, кто подписался позже.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card">
    <div class="title-blue"><code>Subject()</code></div>
    <p class="text-xs text-[#3a372f] mb-2">
      <strong>Ничего не помнит.</strong> Не требует стартового значения. Новый подписчик получает только те события, которые произошли после его подписки.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded text-[11px] m-0">const clicks$ =
  new Subject&lt;void&gt;();
// Для кнопок и команд</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal"><code>BehaviorSubject(init)</code></div>
    <p class="text-xs text-[#3a372f] mb-2">
      <strong>Помнит 1 последнее значение.</strong> Обязательно требует начальное значение и сразу отдаёт текущее состояние новому подписчику.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded text-[11px] m-0">const theme$ =
  new BehaviorSubject('dark');
// Для состояния экрана</pre>
  </div>
  <div class="comet-card">
    <div class="title-orange"><code>ReplaySubject(N)</code></div>
    <p class="text-xs text-[#3a372f] mb-2">
      <strong>Помнит N последних значений.</strong> Начальное значение не нужно: проигрывает новому подписчику буфер из N прошлых событий по порядку.
    </p>
    <pre v-pre class="comet-card--code p-2 rounded text-[11px] m-0">const history$ =
  new ReplaySubject(2);
// Для истории действий</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">SUBJECT И МНОГОАДРЕСНЫЕ ПОТОКИ</span>
<h2><code>share()</code> и <code>shareReplay()</code> — один запрос на всех</h2>
<p class="comet-subtitle">Как превратить холодный поток (где каждая подписка делает новый запрос) в общий поток для нескольких компонентов.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-blue"><code>share()</code> — делит текущий живой поток</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Объединяет подписчиков, пока поток работает, но <strong>не запоминает</strong> прошлые значения. Если второй подписчик придёт после завершения запроса, запрос запустится заново.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">// Подходит для живых потоков (WebSocket, таймер):
const sharedTicks$ = interval(1000).pipe(
  share()
);</pre>
  </div>
  <div class="comet-card">
    <div class="title-green"><code>shareReplay(1)</code> — общий запрос + память</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Запрос к серверу выполняется один раз, а полученный ответ сохраняется в буфере. Даже те компоненты, которые подпишутся позже, сразу возьмут готовый ответ из кеша.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">config$ = this.http.get('/api/config').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);
// 3 подписки в разное время = 1 запрос в сеть</pre>
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
<p class="comet-subtitle !text-[1.2rem]">Оператор scan, паттерн редюсера и асинхронные эффекты (Effects pattern)</p>

<SectionStepper :total="11" :active="9" />

---
transition: slide-left
---

<span class="comet-pill">СОСТОЯНИЕ И ЭФФЕКТЫ</span>
<h2><code>scan()</code> — накопление состояния на каждом шаге</h2>
<p class="comet-subtitle">Работает как <code>Array.reduce</code>, но выдаёт обновлённый результат после каждого нового события в потоке.</p>

<div class="comet-grid-2 my-auto items-center">
  <MarbleStream
    pipeline
    :tracks="[
      {
        name: 'changes$',
        items: [
          { x: 16, label: '+1', color: 'teal' },
          { x: 38, label: '+1', color: 'teal' },
          { x: 60, label: '-1', color: 'orange' },
          { x: 82, label: '+1', color: 'teal' }
        ]
      },
      {
        name: 'scan (с 0)',
        completeAt: 90,
        items: [
          { x: 16, label: '1', color: 'green', detail: '0 + 1 = 1' },
          { x: 38, label: '2', color: 'green', detail: '1 + 1 = 2' },
          { x: 60, label: '1', color: 'green', detail: '2 - 1 = 1' },
          { x: 82, label: '2', color: 'green', detail: '1 + 1 = 2' }
        ]
      }
    ]"
    :steps="[
      { x: 16, text: 'Начальное значение (seed) равно 0. Приходит +1 → аккумулятор становится 0 + 1 = 1.' },
      { x: 38, text: 'Приходит ещё +1 → прибавляем к прошлому состоянию: 1 + 1 = 2.' },
      { x: 60, text: 'Приходит -1 → вычитаем из текущего состояния: 2 - 1 = 1.' },
      { x: 82, text: 'Приходит +1 → снова получаем 2.' }
    ]"
  />
  <div class="flex flex-col gap-3">
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">const changes$ = from([1, 1, -1, 1]);
const count$ = changes$.pipe(
  scan((count, change) =&gt; count + change, 0)
);
count$.subscribe(v =&gt; console.log('Счёт:', v));
// Счёт: 1 → Счёт: 2 → Счёт: 1 → Счёт: 2</pre>
    <div class="comet-card">
      <div class="title-teal !text-sm">Зачем это нужно в интерфейсе</div>
      <p class="text-xs text-[#3a372f] m-0">
        С помощью <code>scan</code> поток разрозненных действий пользователя («добавил товар», «удалил товар») превращается в единый поток текущего состояния корзины или списка.
      </p>
    </div>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">СОСТОЯНИЕ И ЭФФЕКТЫ</span>
<h2><code>scan()</code> как редюсер и паттерн эффектов</h2>
<p class="comet-subtitle">Две половинки архитектуры управления состоянием (как в Redux и NgRx), написанные в несколько строк на RxJS.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-teal">1. Редюсер на <code>scan</code>: события → состояние</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Чистая функция принимает прошлое состояние и объект действия (<code>action</code>), возвращая <strong>новый объект состояния</strong> без мутации старого:
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-[11px] m-0">const state$ = actions$.pipe(
  scan((state, action) =&gt; {
    if (action.type === 'add') {
      return [...state, action.todo];
    }
    if (action.type === 'clear') return [];
    return state;
  }, [] as string[])
);</pre>
  </div>
  <div class="comet-card">
    <div class="title-orange">2. Паттерн эффектов: события → запросы</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Слушает поток действий, отбирает нужный тип через <code>filter</code>, выполняет запрос к серверу и возвращает новое действие с результатом:
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-[11px] m-0">const saveEffect$ = actions$.pipe(
  filter(a =&gt; a.type === 'save'),
  // concatMap сохраняет строгий порядок запросов:
  concatMap(a =&gt;
    api.save(a).pipe(
      map(() =&gt; ({ type: 'saved', id: a.id }))
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
<p class="comet-subtitle">Почти любая задача в Angular собирается из сетевых запросов, параметров маршрута и полей форм.</p>

<div class="comet-grid-3 my-auto">
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-teal">1. Запросы <code>HttpClient</code></div>
      <p class="text-xs text-[#3a372f]">
        Возвращают холодный поток: запрос уходит при подписке, а при отписке браузер автоматически прерывает незавершённый сетевой вызов.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded text-[11px] m-0">getUser(id: string) {
  return this.http.get&lt;User&gt;(
    `/api/users/${id}`
  );
}</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-blue">2. Параметры <code>route.paramMap</code></div>
      <p class="text-xs text-[#3a372f]">
        При смене адреса страницы роутер присылает новый <code>id</code>. В связке со <code>switchMap</code> старый запрос товара сразу отменяется.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded text-[11px] m-0">user$ = this.route.paramMap.pipe(
  switchMap(params =&gt;
    this.getUser(params.get('id')!)
  )
);</pre>
  </div>
  <div class="comet-card flex flex-col justify-between">
    <div>
      <div class="title-orange">3. Поля форм <code>valueChanges</code></div>
      <p class="text-xs text-[#3a372f]">
        Каждое изменение поля превращается в поток: ждём паузу, убираем повторы и запрашиваем свежий список.
      </p>
    </div>
    <pre v-pre class="comet-card--code p-2 rounded text-[11px] m-0">books$ = this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q =&gt; this.api.find(q))
);</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">RXJS В ANGULAR</span>
<h2>Как не забывать отписываться в Angular</h2>
<p class="comet-subtitle">Два надёжных способа привязать жизнь потока к жизни компонента.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-green">1. Для шаблона: <code>| async</code> или <code>toSignal()</code></div>
    <p class="text-sm text-[#3a372f] mb-3">
      Если данные нужны только для отрисовки на экране, вообще не вызывайте <code>subscribe()</code> вручную. Шаблон сам подпишется и сам отпишется при удалении компонента.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">// Вариант с AsyncPipe в шаблоне:
@if (users$ | async; as users) {
  &lt;app-list [items]="users" /&gt;
}
// Вариант с сигналом в классе компонента:
users = toSignal(this.api.getUsers(), { initialValue: [] });</pre>
  </div>
  <div class="comet-card">
    <div class="title-teal">2. Для кода класса: <code>takeUntilDestroyed()</code></div>
    <p class="text-sm text-[#3a372f] mb-3">
      Если всё же нужен ручной <code>subscribe()</code>, добавьте <code>takeUntilDestroyed</code>. В конструкторе он работает без аргументов, а в <code>ngOnInit</code> нужно передать <code>this.destroyRef</code>.
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-xs m-0">private destroyRef = inject(DestroyRef);
ngOnInit() {
  this.player.track$.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(track =&gt; this.onTrack(track));
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
<h1 class="!text-[3.2rem] mt-2">Практические проекты и тесты</h1>
<p class="comet-subtitle !text-[1.2rem]">Marble-тестирование, создание собственных операторов и финальный оператор liveSearch</p>

<SectionStepper :total="11" :active="11" />

---
transition: slide-left
---

<span class="comet-pill">ПРАКТИЧЕСКИЕ ПРОЕКТЫ</span>
<h2>Готовые рецепты: автосохранение и защита кнопок</h2>
<p class="comet-subtitle">Как собираются реальные сценарии интерфейса из нескольких базовых операторов.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-teal">1. Автосохранение черновика (Autosave)</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Ждём паузу после набора текста, проверяем, что текст действительно изменился, и сохраняем черновик через <code>switchMap</code>:
    </p>
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">draftText$.pipe(
  debounceTime(400),
  distinctUntilChanged(),
  switchMap(text =&gt; this.api.saveDraft(text))
)</pre>
  </div>
  <div class="comet-card">
    <div class="title-orange">2. Защита кнопки отправки и последовательность</div>
    <p class="text-sm text-[#3a372f] mb-3">
      Для кнопки отправки используем <code>exhaustMap</code> (игнорирует двойной клик), а когда второй запрос зависит от ответа первого — <code>concatMap</code>:
    </p>
    <pre v-pre class="comet-card--code p-3 rounded text-xs m-0">// 1) Защита от двойного клика:
submitClick$.pipe(exhaustMap(() =&gt; this.api.login()));
// 2) Запрос профиля сразу после получения userId:
getUserId$().pipe(concatMap(id =&gt; this.api.getProfile(id)));</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ПРАКТИЧЕСКИЕ ПРОЕКТЫ И ТЕСТЫ</span>
<h2>Свои операторы и Marble-тестирование</h2>
<p class="comet-subtitle">Любую повторяющуюся цепочку можно вынести в отдельную функцию-оператор и проверить в виртуальном времени.</p>

<div class="comet-grid-2 my-auto">
  <div class="comet-card">
    <div class="title-teal">Свой оператор — это обычная функция</div>
    <p class="text-xs text-[#3a372f] mb-2">
      Функция принимает настройки и возвращает функцию <code>source$ => source$.pipe(...)</code>. Никакой магии — внутри те же стандартные операторы:
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-[11px] m-0">// Создаём свой оператор для логирования:
function debugLabel&lt;T&gt;(label: string) {
  return (source$: Observable&lt;T&gt;) =&gt;
    source$.pipe(
      tap(value =&gt; console.log(`${label}:`, value))
    );
}
// Используем внутри обычного pipe():
stream$.pipe(debugLabel('Ответ API'), map(x =&gt; x.data));</pre>
  </div>
  <div class="comet-card">
    <div class="title-blue">Marble-тесты: проверка за миллисекунды</div>
    <p class="text-xs text-[#3a372f] mb-2">
      <code>TestScheduler</code> проверяет <code>map</code>, <code>filter</code> и таймеры по текстовой схеме (<code>-a-b|</code>), не дожидаясь реальных секунд:
    </p>
    <pre v-pre class="comet-card--code p-2.5 rounded text-[11px] m-0">scheduler.run(({ cold, expectObservable }) =&gt; {
  const source$ = cold('-a-b-c|', { a: 1, b: 2, c: 3 });
  const result$ = source$.pipe(
    filter(x =&gt; x &gt; 1),
    map(x =&gt; x * 10)
  );
  expectObservable(result$).toBe('---b-c|', { b: 20, c: 30 });
});</pre>
  </div>
</div>

---
transition: slide-left
---

<span class="comet-pill">ФИНАЛЬНЫЙ ПРОЕКТ КУРСА</span>
<h2>Полный оператор <code>liveSearch</code> для продакшена</h2>
<p class="comet-subtitle">Объединяем управление вводом, отмену устаревших запросов, повторную попытку и защиту от падения.</p>

<div class="comet-grid-2 my-auto items-center">
  <pre v-pre class="comet-card--code p-3.5 rounded text-xs m-0">function liveSearch&lt;T&gt;(searchApi: (q: string) =&gt; Observable&lt;T&gt;) {
  return (source$: Observable&lt;string&gt;) =&gt;
    source$.pipe(
      debounceTime(300),        // 1. Ждём паузу в наборе
      distinctUntilChanged(),   // 2. Отсекаем повтор того же слова
      switchMap(query =&gt;
        searchApi(query).pipe(  // 3. Внутренний запрос к API
          retry(1),             // 4. Один повтор при случайном сбое
          catchError(() =&gt; of('Fallback: ' + query))
        )
      )
    );
}</pre>
  <div class="flex flex-col gap-3">
    <div class="comet-card">
      <div class="title-teal !text-sm">Почему это надёжно</div>
      <ul class="text-xs space-y-2 pl-4 m-0 text-[#3a372f]">
        <li><strong>Экономит запросы:</strong> быстрый набор отсекается через <code>debounceTime</code> и <code>distinctUntilChanged</code>.</li>
        <li><strong>Нет гонки ответов:</strong> <code>switchMap</code> отменяет старый запрос, если пользователь продолжил печатать.</li>
        <li><strong>Не ломается при сбое:</strong> <code>retry(1)</code> и <code>catchError</code> стоят <strong>внутри</strong> <code>switchMap</code>, поэтому ошибка одного запроса никогда не убьёт строку поиска.</li>
      </ul>
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
<p class="comet-subtitle">Сформулируйте словами, что нужно сделать с потоком, — и выберите подходящий оператор.</p>

<OperatorMatrix />

---
class: comet-dark
transition: fade-out
---

<div class="flex items-center justify-between h-full gap-8">
  <div class="flex flex-col max-w-[62%]">
    <span class="comet-pill">ИТОГИ ЛЕКЦИИ</span>
    <h1 class="!text-[3.3rem] !leading-[1.08] mt-2 mb-4">
      Интерфейс — это<br />события во времени
    </h1>
    <p class="comet-subtitle !text-[1.15rem] mb-6">
      RxJS помогает спокойно описывать сложные цепочки событий: ждать паузу при вводе, вовремя отменять устаревшие запросы, накапливать состояние и не допускать утечек памяти.
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
    <CometCat mood="success" :size="145" dark caption="Все 12 заданий и потоков настроены!" />
    <div class="font-mono text-xs text-[#9f9d96] bg-[#201f1d] border border-[#3a372f] px-4 py-2 rounded-full">
      событие &nbsp;→&nbsp; pipe() &nbsp;→&nbsp; состояние экрана
    </div>
  </div>
</div>
