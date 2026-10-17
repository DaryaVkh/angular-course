<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import CometCat from './CometCat.vue';
import { markMissionCompleted, isMissionCompleted } from './questStore';

const props = defineProps<{
  level: number;
}>();

interface CardOption {
  id: string;
  label: string;
  desc: string;
  whyWrong?: string;
  wrongOut?: SimMarble[];
}

interface SimMarble {
  val: string;
  kind: 'event' | 'next' | 'cancel' | 'error';
  color: string;
}

interface MissionConfig {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  initialMood: 'sleeping' | 'tangled' | 'working' | 'error' | 'idle';
  catProblemText: string;
  catSuccessText: string;
  sourceLabel: string;
  sourceMarbles: SimMarble[];
  expectedLabel: string;
  expectedMarbles: SimMarble[];
  codePrefix: string;
  codeSuffix: string;
  joinWith: string;
  cards: CardOption[];
  slotsCount: number;
  correctCardIds: string[];
  wrongOrderMsg?: string;
  hint: string;
}

const MISSIONS: Record<number, MissionConfig> = {
  1: {
    id: 1,
    code: 'ЗАДАНИЕ 1 · РАЗДЕЛ 1',
    title: 'Почему поток ничего не делает?',
    subtitle: 'Мы создали поток feed$ через of(), но миска пуста. Выберите карточку, которая запустит поток.',
    initialMood: 'sleeping',
    catProblemText: 'Поток feed$ объявлен в коде, но данные по нему ещё не пошли — никто не подписался.',
    catSuccessText: 'Поток запущен! Вызов subscribe() запустил передачу данных, и все 3 порции попали в миску.',
    sourceLabel: 'feed$ = of("🐟 1", "🐟 2", "🐟 3")',
    sourceMarbles: [
      { val: '🐟 1', kind: 'event', color: '#01696f' },
      { val: '🐟 2', kind: 'event', color: '#01696f' },
      { val: '🐟 3', kind: 'event', color: '#01696f' },
    ],
    expectedLabel: 'Миска (все 3 порции доставлены)',
    expectedMarbles: [
      { val: '🐟 1', kind: 'next', color: '#437a22' },
      { val: '🐟 2', kind: 'next', color: '#437a22' },
      { val: '🐟 3', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `const feed$ = of('🐟 1', '🐟 2', '🐟 3');\nfeed$.`,
    codeSuffix: `;`,
    joinWith: '',
    cards: [
      {
        id: 'subscribe(feedCat)',
        label: 'subscribe(feedCat)',
        desc: 'Подписаться на поток и передать обработчик',
      },
      {
        id: 'pipe(feedCat)',
        label: 'pipe(feedCat)',
        desc: 'Собрать цепочку операторов',
        whyWrong:
          'Не решает проблему: метод pipe() только соединяет операторы в цепочку, но сам по себе поток не запускает. Без subscribe() данные не пойдут.',
        wrongOut: [{ val: 'тишина (поток не запущен)', kind: 'cancel', color: '#8c8980' }],
      },
      {
        id: 'then(feedCat)',
        label: 'then(feedCat)',
        desc: 'Дождаться ответа как в Promise',
        whyWrong:
          'Не решает проблему: у Observable нет метода then() — он есть только у Promise. Для запуска потока используется subscribe().',
        wrongOut: [{ val: 'TypeError: feed$.then is not a function', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'map(feedCat)',
        label: 'map(feedCat)',
        desc: 'Преобразовать каждое значение',
        whyWrong:
          'Не решает проблему: map() — это оператор изменения данных внутри pipe(). Он не запускает поток без вызова subscribe().',
        wrongOut: [{ val: 'тишина (нет подписки)', kind: 'cancel', color: '#8c8980' }],
      },
    ],
    slotsCount: 1,
    correctCardIds: ['subscribe(feedCat)'],
    hint: 'Объявление of(...) похоже на объявление функции. Чтобы поток начал выдавать значения, вызовите .subscribe(feedCat).',
  },

  2: {
    id: 2,
    code: 'ЗАДАНИЕ 2 · РАЗДЕЛ 2',
    title: 'Подписчик подключился позже и пропустил данные',
    subtitle: 'Датчик уже выставил температуру 22°C. Какой источник сразу отдаст текущее значение новому подписчику?',
    initialMood: 'tangled',
    catProblemText: 'С обычным Subject экран не узнает текущую температуру 22°C, пока датчик не пришлёт новое значение.',
    catSuccessText: 'Отлично! BehaviorSubject(22) сохранил текущую температуру и сразу отдал 22°C при подписке.',
    sourceLabel: 'Датчик: старт 22°C → затем 24°C',
    sourceMarbles: [
      { val: '22°C (старт)', kind: 'event', color: '#01696f' },
      { val: '24°C', kind: 'event', color: '#006494' },
    ],
    expectedLabel: 'Экран термостата (сразу 22°C, затем 24°C)',
    expectedMarbles: [
      { val: '22°C', kind: 'next', color: '#437a22' },
      { val: '24°C', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `const temp$ = new `,
    codeSuffix: `;\ntemp$.subscribe(render); // сразу получит 22°C\ntemp$.next(24);`,
    joinWith: '',
    cards: [
      {
        id: 'BehaviorSubject(22)',
        label: 'BehaviorSubject(22)',
        desc: 'Хранит последнее значение и сразу отдаёт при подписке',
      },
      {
        id: 'Subject()',
        label: 'Subject()',
        desc: 'Передаёт только события после момента подписки',
        whyWrong:
          'Не решает проблему: обычный Subject не помнит прошлых значений. Подписчик пропустит начальные 22°C и увидит только 24°C.',
        wrongOut: [
          { val: '22°C пропущено!', kind: 'error', color: '#da7101' },
          { val: '24°C', kind: 'next', color: '#437a22' },
        ],
      },
      {
        id: 'Observable()',
        label: 'Observable()',
        desc: 'Базовый поток без хранения состояния',
        whyWrong:
          'Не решает проблему: у базового Observable нет метода .next(24) снаружи и он не хранит текущее значение.',
        wrongOut: [{ val: 'Ошибка: нет метода temp$.next()', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'of(22)',
        label: 'of(22)',
        desc: 'Создать поток из числа 22 и сразу завершиться',
        whyWrong:
          'Не решает проблему: of(22) отдаст 22 и тут же закроется (complete). Отправить в него следующее значение 24°C через .next() нельзя.',
        wrongOut: [
          { val: '22°C', kind: 'next', color: '#437a22' },
          { val: 'поток закрыт (нет .next)', kind: 'error', color: '#a13544' },
        ],
      },
    ],
    slotsCount: 1,
    correctCardIds: ['BehaviorSubject(22)'],
    hint: 'Если новому подписчику нужно сразу получить текущее состояние, используйте BehaviorSubject с начальным значением.',
  },

  3: {
    id: 3,
    code: 'ЗАДАНИЕ 3 · РАЗДЕЛ 3',
    title: 'Распаковать массив и взять первые 3 порции',
    subtitle: 'В массиве 5 элементов. Нужно выдать их в поток по одному и остановиться после первых трёх.',
    initialMood: 'tangled',
    catProblemText: 'Если передать массив в of(), прилетит весь массив разом, а без ограничения попадутся кость и брокколи.',
    catSuccessText: 'Верно! from(items) выдал элементы по одному, а take(3) вовремя завершил поток.',
    sourceLabel: 'items = ["🐟", "🍤", "🥩", "🦴", "🥦"]',
    sourceMarbles: [{ val: '["🐟", "🍤", "🥩", "🦴", "🥦"]', kind: 'event', color: '#da7101' }],
    expectedLabel: 'Поток выдаёт 3 элемента по одному и завершается',
    expectedMarbles: [
      { val: '🐟', kind: 'next', color: '#437a22' },
      { val: '🍤', kind: 'next', color: '#437a22' },
      { val: '🥩', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `const items = ['🐟', '🍤', '🥩', '🦴', '🥦'];\n`,
    codeSuffix: `.subscribe(eatOneByOne);`,
    joinWith: '.',
    cards: [
      {
        id: 'from(items)',
        label: 'from(items)',
        desc: 'Выдать каждый элемент массива отдельным значением',
      },
      {
        id: 'pipe(take(3))',
        label: 'pipe(take(3))',
        desc: 'Взять первые 3 значения и закрыть поток',
      },
      {
        id: 'of(items)',
        label: 'of(items)',
        desc: 'Выдать весь массив как одно значение',
        whyWrong:
          'Не решает проблему: of(items) не разбирает массив на части, а отправляет его целиком за один вызов next([🐟, 🍤, ...]).',
        wrongOut: [{ val: '[Весь массив одним куском]', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'pipe(filter(3))',
        label: 'pipe(filter(3))',
        desc: 'Отфильтровать значения по условию',
        whyWrong:
          'Не решает проблему: filter() ждёт функцию-проверку для каждого элемента и не умеет отсчитывать первые 3 события.',
        wrongOut: [{ val: 'Ошибка: filter ждёт функцию-условие', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 2,
    correctCardIds: ['from(items)', 'pipe(take(3))'],
    wrongOrderMsg:
      'Порядок карточек перепутан: сначала нужно создать поток из массива через from(items), а затем ограничить его через .pipe(take(3)).',
    hint: 'Сначала превратите массив в поток отдельных элементов через from(items), затем возьмите 3 штуки с помощью pipe(take(3)).',
  },

  4: {
    id: 4,
    code: 'ЗАДАНИЕ 4 · РАЗДЕЛ 4',
    title: 'Собрать цепочку операторов в правильном порядке',
    subtitle: 'Сначала уберите повторы подряд и лишние кости ("🦴"), а затем преобразуйте данные.',
    initialMood: 'working',
    catProblemText: 'Если преобразовывать данные до фильтрации, мы тратим силы впустую и пропускаем мусор на экран.',
    catSuccessText: 'Чистая цепочка! Сначала убрали повторы и кости, и только для нужных элементов вызвали map().',
    sourceLabel: '"🐟" → "🐟" → "🦴" → "🍤"',
    sourceMarbles: [
      { val: '🐟', kind: 'event', color: '#01696f' },
      { val: '🐟 (дубль)', kind: 'event', color: '#da7101' },
      { val: '🦴', kind: 'event', color: '#a13544' },
      { val: '🍤', kind: 'event', color: '#01696f' },
    ],
    expectedLabel: 'только "✨🐟" и "✨🍤"',
    expectedMarbles: [
      { val: '✨🐟', kind: 'next', color: '#437a22' },
      { val: '✨🍤', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `belt$.pipe(`,
    codeSuffix: `).subscribe(serveCat);`,
    joinWith: ', ',
    cards: [
      {
        id: 'distinctUntilChanged()',
        label: 'distinctUntilChanged()',
        desc: 'Отсеять идущие подряд одинаковые значения',
      },
      {
        id: "filter(x => x !== '🦴')",
        label: "filter(x => x !== '🦴')",
        desc: 'Пропустить дальше только съедобные порции',
      },
      {
        id: "map(x => '✨' + x)",
        label: "map(x => '✨' + x)",
        desc: 'Преобразовать прошедшее значение в новое',
      },
      {
        id: "tap(x => '✨' + x)",
        label: "tap(x => '✨' + x)",
        desc: 'Выполнить побочное действие (например, лог)',
        whyWrong:
          'Не решает проблему: tap() не меняет данные в потоке — возвращённое из него значение просто игнорируется. Для преобразования нужен map().',
        wrongOut: [
          { val: '🐟 (без ✨)', kind: 'error', color: '#da7101' },
          { val: '🍤 (без ✨)', kind: 'error', color: '#da7101' },
        ],
      },
    ],
    slotsCount: 3,
    correctCardIds: [
      'distinctUntilChanged()',
      "filter(x => x !== '🦴')",
      "map(x => '✨' + x)",
    ],
    wrongOrderMsg:
      'Порядок операторов нарушен: если поставить map() раньше filter() или distinctUntilChanged(), то "🦴" сначала превратится в "✨🦴" и пройдёт сквозь фильтр!',
    hint: 'Поставьте операторы в порядке: 1) distinctUntilChanged() → 2) filter(x => x !== "🦴") → 3) map(x => "✨" + x).',
  },

  5: {
    id: 5,
    code: 'ЗАДАНИЕ 5 · РАЗДЕЛ 5',
    title: 'Поиск без гонки и кнопка оплаты без дублей',
    subtitle: 'Выберите оператор для живого поиска (слот 1) и оператор для кнопки «Оплатить» (слот 2).',
    initialMood: 'tangled',
    catProblemText: 'В поиске старый медленный ответ перезаписывает новый, а двойной клик по кнопке списывает оплату дважды!',
    catSuccessText: 'Отлично! switchMap отменяет устаревшие запросы поиска, а exhaustMap защищает кнопку оплаты от повторных кликов.',
    sourceLabel: '1) Поиск: "rx" → "rxjs"   |   2) Оплата: клик 1 → клик 2',
    sourceMarbles: [
      { val: 'поиск "rx"', kind: 'event', color: '#01696f' },
      { val: 'поиск "rxjs"', kind: 'event', color: '#006494' },
      { val: 'оплата #1', kind: 'event', color: '#da7101' },
      { val: 'оплата #2', kind: 'event', color: '#da7101' },
    ],
    expectedLabel: 'Старый поиск отменён, второй клик оплаты проигнорирован',
    expectedMarbles: [
      { val: 'rx отменён ✕', kind: 'cancel', color: '#a13544' },
      { val: 'ответ "rxjs"', kind: 'next', color: '#437a22' },
      { val: 'оплата #1 ок', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `// Слот 1 — для поиска, Слот 2 — для оплаты:\n`,
    codeSuffix: ``,
    joinWith: '\n',
    cards: [
      {
        id: 'search$: switchMap',
        label: '1) Поиск → switchMap',
        desc: 'Отменяет предыдущий запрос, когда ввели новый текст',
      },
      {
        id: 'pay$: exhaustMap',
        label: '2) Оплата → exhaustMap',
        desc: 'Игнорирует новые клики, пока текущий запрос не завершился',
      },
      {
        id: 'mergeMap (параллельно)',
        label: 'mergeMap (параллельно)',
        desc: 'Запускает все запросы параллельно без отмены',
        whyWrong:
          'Не решает проблему: mergeMap не отменяет старый поиск (возникает гонка ответов) и не блокирует повторный клик оплаты (деньги спишутся дважды).',
        wrongOut: [
          { val: 'Гонка ответов в поиске!', kind: 'error', color: '#a13544' },
          { val: 'Двойное списание оплаты!', kind: 'error', color: '#a13544' },
        ],
      },
      {
        id: 'concatMap (очередь)',
        label: 'concatMap (по очереди)',
        desc: 'Ставит все события в очередь друг за другом',
        whyWrong:
          'Не решает проблему: concatMap не отбрасывает второй клик по кнопке оплаты, а бережно ставит его в очередь и списывает деньги второй раз сразу после первого запроса.',
        wrongOut: [{ val: 'Второй клик выполнился из очереди!', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 2,
    correctCardIds: ['search$: switchMap', 'pay$: exhaustMap'],
    wrongOrderMsg:
      'Поменяйте местами: в первый слот поставьте switchMap для поиска, а во второй — exhaustMap для оплаты.',
    hint: 'Для живого поиска важна актуальность (switchMap отменяет старый запрос), а для кнопки оплаты — защита от повторов (exhaustMap игнорирует клики, пока занят).',
  },

  6: {
    id: 6,
    code: 'ЗАДАНИЕ 6 · РАЗДЕЛ 6',
    title: 'Сначала кеш, потом сервер + старт фильтров',
    subtitle: 'Слот 1: показать cache$, а после него server$. Слот 2: разбудить combineLatest при старте.',
    initialMood: 'tangled',
    catProblemText: 'С merge() медленный кеш или быстрый ответ могут перепутаться, а combineLatest ждёт первый ввод в фильтр.',
    catSuccessText: 'Верно! concat(cache$, server$) гарантирует порядок, а startWith("") сразу запускает combineLatest.',
    sourceLabel: '1) cache$ затем server$   |   2) filter.valueChanges в combineLatest',
    sourceMarbles: [
      { val: 'cache$', kind: 'event', color: '#01696f' },
      { val: 'server$', kind: 'event', color: '#006494' },
      { val: 'filter (молчит)', kind: 'cancel', color: '#da7101' },
    ],
    expectedLabel: 'Строго Cache → Server, и каталог грузится сразу при старте',
    expectedMarbles: [
      { val: 'Cache Data', kind: 'next', color: '#437a22' },
      { val: 'Server Data', kind: 'next', color: '#437a22' },
      { val: '["", page=1]', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `const data$ = `,
    codeSuffix: `; // и фильтр с начальным значением`,
    joinWith: ' + ',
    cards: [
      {
        id: 'concat(cache$, server$)',
        label: '1) concat(cache$, server$)',
        desc: 'Подписаться на server$ строго после завершения cache$',
      },
      {
        id: "startWith('')",
        label: "2) startWith('')",
        desc: 'Сразу выдать пустую строку при подписке на фильтр',
      },
      {
        id: 'merge(cache$, server$)',
        label: 'merge(cache$, server$)',
        desc: 'Запустить оба потока одновременно без гарантии порядка',
        whyWrong:
          'Не решает проблему: merge() запускает оба источника параллельно — если cache$ асинхронный и чуть задержится, он перезапишет свежие данные с сервера!',
        wrongOut: [{ val: 'Порядок нарушен: кеш поверх сервера!', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'forkJoin([filter$, page$])',
        label: 'forkJoin([filter$, page$])',
        desc: 'Ждать полного завершения (complete) всех потоков',
        whyWrong:
          'Не решает проблему: forkJoin ждёт complete от каждого источника, но живая форма фильтра никогда не завершается.',
        wrongOut: [{ val: 'Вечное ожидание complete...', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 2,
    correctCardIds: ['concat(cache$, server$)', "startWith('')"],
    wrongOrderMsg:
      'В первый слот выберите concat(cache$, server$), а во второй — startWith("").',
    hint: 'Для строгой очереди «сначала кеш, затем сервер» нужен concat(cache$, server$), а для первого значения формы в combineLatest — startWith("").',
  },

  7: {
    id: 7,
    code: 'ЗАДАНИЕ 7 · РАЗДЕЛ 6',
    title: 'Клик сохранения + текущая роль пользователя',
    subtitle: 'Сохранение должно срабатывать ТОЛЬКО при клике по кнопке, но брать актуальную роль из потока role$.',
    initialMood: 'tangled',
    catProblemText: 'С combineLatest сохранение случайно запускается каждый раз, когда в фоне меняется роль пользователя!',
    catSuccessText: 'Точно! withLatestFrom(role$) срабатывает только по клику кнопки, подглядывая в текущую роль.',
    sourceLabel: 'saveClick$ (главный) + role$ ("user" → "admin")',
    sourceMarbles: [
      { val: 'role: "admin"', kind: 'event', color: '#006494' },
      { val: 'saveClick', kind: 'event', color: '#01696f' },
    ],
    expectedLabel: 'Запрос уходит только в момент клика: "Save as admin"',
    expectedMarbles: [{ val: 'Save as admin', kind: 'next', color: '#437a22' }],
    codePrefix: `saveClick$.pipe(\n  `,
    codeSuffix: `,\n  map(([, role]) => 'Save as ' + role)\n)`,
    joinWith: '',
    cards: [
      {
        id: 'withLatestFrom(role$)',
        label: 'withLatestFrom(role$)',
        desc: 'Срабатывать только от saveClick$, беря последнее значение role$',
      },
      {
        id: 'combineLatest([role$])',
        label: 'combineLatest([role$])',
        desc: 'Срабатывать при изменении любого из потоков',
        whyWrong:
          'Не решает проблему: в combineLatest все потоки равны — любая фоновая смена role$ будет сама по себе вызывать сохранение без клика пользователя!',
        wrongOut: [{ val: 'Ложное сохранение без клика!', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'merge(role$)',
        label: 'merge(role$)',
        desc: 'Слить клики и роли в одну общую дорожку по очереди',
        whyWrong:
          'Не решает проблему: merge() просто смешивает события разных типов в один поток вместо того, чтобы соединить клик с текущей ролью.',
        wrongOut: [{ val: 'В потоке смешались строки и клики', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'forkJoin([role$])',
        label: 'forkJoin([role$])',
        desc: 'Дождаться завершения обоих потоков',
        whyWrong:
          'Не решает проблему: поток кликов по кнопке saveClick$ не завершается, поэтому forkJoin никогда не выдаст результат.',
        wrongOut: [{ val: 'Тишина — потоки не завершены', kind: 'error', color: '#da7101' }],
      },
    ],
    slotsCount: 1,
    correctCardIds: ['withLatestFrom(role$)'],
    hint: 'Когда есть главное событие (клик) и вспомогательное состояние (роль), используйте withLatestFrom(role$).',
  },

  8: {
    id: 8,
    code: 'ЗАДАНИЕ 8 · РАЗДЕЛ 7',
    title: 'Почему после одной ошибки перестаёт работать поиск?',
    subtitle: 'Запрос "bad" упал с ошибкой — и после этого поиск перестал реагировать на новый ввод "next"!',
    initialMood: 'error',
    catProblemText: 'catchError стоит снаружи switchMap: ошибка закрыла весь внешний поток поиска навсегда!',
    catSuccessText: 'Исправлено! catchError внутри switchMap гасит ошибку только одного запроса, а поиск продолжает жить.',
    sourceLabel: 'Ввод по очереди: "ok" → "bad" (500 Error) → "next"',
    sourceMarbles: [
      { val: '"ok"', kind: 'event', color: '#01696f' },
      { val: '"bad" (ошибка)', kind: 'error', color: '#a13544' },
      { val: '"next"', kind: 'event', color: '#01696f' },
    ],
    expectedLabel: 'Поток переживает ошибку "bad" и обрабатывает "next"',
    expectedMarbles: [
      { val: 'Result: ok', kind: 'next', color: '#437a22' },
      { val: 'Fallback: bad', kind: 'next', color: '#da7101' },
      { val: 'Result: next', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `query$.pipe(\n  `,
    codeSuffix: `\n)`,
    joinWith: '',
    cards: [
      {
        id: 'switchMap(q => api(q).pipe(catchError(...)))',
        label: 'catchError ВНУТРИ switchMap',
        desc: 'Ловить ошибку на внутреннем запросе api(q).pipe(catchError(...))',
      },
      {
        id: 'switchMap(q => api(q)), catchError(...)',
        label: 'catchError СНАРУЖИ switchMap',
        desc: 'Поставить catchError следующей строкой после switchMap',
        whyWrong:
          'Не решает проблему: когда ошибка долетает до внешнего pipe(), сам поток query$ переходит в состояние завершённого. На следующий ввод "next" он уже не среагирует!',
        wrongOut: [
          { val: 'Result: ok', kind: 'next', color: '#437a22' },
          { val: 'Fallback: bad', kind: 'next', color: '#da7101' },
          { val: 'поиск мёртв ("next" потерян) ✕', kind: 'error', color: '#a13544' },
        ],
      },
      {
        id: 'tap({ error: console.error })',
        label: 'tap({ error: console.error })',
        desc: 'Записать ошибку в консоль через tap',
        whyWrong:
          'Не решает проблему: tap() только логирует ошибку, но не перехватывает её — поток поиска всё равно аварийно закроется.',
        wrongOut: [{ val: 'Uncaught Error — поток закрыт ✕', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'finalize(() => reset())',
        label: 'finalize(() => reset())',
        desc: 'Выполнить код уборки при закрытии потока',
        whyWrong:
          'Не решает проблему: finalize() выполняется уже тогда, когда поток закрывается, но не спасает поток от падения при ошибке.',
        wrongOut: [{ val: 'Поток закрылся с ошибкой ✕', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 1,
    correctCardIds: ['switchMap(q => api(q).pipe(catchError(...)))'],
    hint: 'Всегда ставьте catchError внутрь switchMap на сам HTTP-запрос, чтобы ошибка одного запроса не закрывала внешний поток событий.',
  },

  9: {
    id: 9,
    code: 'ЗАДАНИЕ 9 · РАЗДЕЛ 8',
    title: 'История последних 2 событий и общий кеш запроса',
    subtitle: 'Слот 1: отдать новому подписчику 2 последних значения из истории. Слот 2: закешировать HTTP-ответ.',
    initialMood: 'tangled',
    catProblemText: 'BehaviorSubject помнит только 1 значение (а нужно 2), а обычный share() не хранит ответ для поздних подписчиков!',
    catSuccessText: 'Отлично! ReplaySubject(2) выдал 2 последних шага истории, а shareReplay(1) сохранил HTTP-ответ в кеше.',
    sourceLabel: 'История: 1 → 2 → 3 → [подписка] → 4',
    sourceMarbles: [
      { val: '1', kind: 'event', color: '#8c8980' },
      { val: '2', kind: 'event', color: '#01696f' },
      { val: '3', kind: 'event', color: '#01696f' },
      { val: '4', kind: 'event', color: '#006494' },
    ],
    expectedLabel: 'Подписчик получает из буфера 2 и 3, затем новое 4',
    expectedMarbles: [
      { val: '2 (из буфера)', kind: 'next', color: '#437a22' },
      { val: '3 (из буфера)', kind: 'next', color: '#437a22' },
      { val: '4', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `const history$ = new `,
    codeSuffix: `;\n// и кеш запроса для новых подписчиков`,
    joinWith: '  |  ',
    cards: [
      {
        id: 'ReplaySubject(2)',
        label: '1) ReplaySubject(2)',
        desc: 'Хранит буфер из 2 последних значений для новых подписчиков',
      },
      {
        id: 'shareReplay({ bufferSize: 1, refCount: true })',
        label: '2) shareReplay(1)',
        desc: 'Один общий запрос + сохранение ответа для поздних подписок',
      },
      {
        id: 'BehaviorSubject(0)',
        label: 'BehaviorSubject(0)',
        desc: 'Хранит только одно самое последнее значение',
        whyWrong:
          'Не решает проблему: BehaviorSubject хранит только 1 текущее значение (3), а значение 2 будет потеряно.',
        wrongOut: [{ val: 'Только 3 (значение 2 потеряно!)', kind: 'error', color: '#da7101' }],
      },
      {
        id: 'share()',
        label: 'share()',
        desc: 'Делит живой поток, но без запоминания прошлых ответов',
        whyWrong:
          'Не решает проблему: обычный share() не запоминает последнее значение — если второй компонент подпишется после завершения HTTP-запроса, всё начнётся заново.',
        wrongOut: [{ val: 'Повторный HTTP-запрос для позднего подписчика!', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 2,
    correctCardIds: [
      'ReplaySubject(2)',
      'shareReplay({ bufferSize: 1, refCount: true })',
    ],
    wrongOrderMsg:
      'В первый слот поставьте ReplaySubject(2) для истории, а во второй — shareReplay для кеширования.',
    hint: 'ReplaySubject(2) хранит ровно 2 последних события, а shareReplay({ bufferSize: 1, refCount: true }) кеширует последний ответ.',
  },

  10: {
    id: 10,
    code: 'ЗАДАНИЕ 10 · РАЗДЕЛ 9',
    title: 'Накопление состояния (scan) и очередь эффектов',
    subtitle: 'Слот 1: посчитать текущую сумму изменений (+1, +1, -1). Слот 2: отправить сохранения на сервер строго по очереди.',
    initialMood: 'working',
    catProblemText: 'Обычный map() не помнит прошлую сумму, а параллельное сохранение через mergeMap путает порядок версий!',
    catSuccessText: 'Собрано! scan() накапливает состояние на каждом шаге, а concatMap сохраняет изменения строго по очереди.',
    sourceLabel: 'Изменения: +1 → +1 → -1 → +1 (старт с 0)',
    sourceMarbles: [
      { val: '+1', kind: 'event', color: '#01696f' },
      { val: '+1', kind: 'event', color: '#01696f' },
      { val: '-1', kind: 'event', color: '#da7101' },
      { val: '+1', kind: 'event', color: '#01696f' },
    ],
    expectedLabel: 'Счётчик выдаёт промежуточную сумму на каждый шаг: 1 → 2 → 1 → 2',
    expectedMarbles: [
      { val: '1', kind: 'next', color: '#437a22' },
      { val: '2', kind: 'next', color: '#437a22' },
      { val: '1', kind: 'next', color: '#437a22' },
      { val: '2', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `const count$ = changes$.pipe(`,
    codeSuffix: `);`,
    joinWith: '  |  ',
    cards: [
      {
        id: 'scan((acc, x) => acc + x, 0)',
        label: '1) scan((acc, x) => acc + x, 0)',
        desc: 'Накапливает значение и сразу отдаёт результат на каждом шаге',
      },
      {
        id: 'concatMap(a => api.save(a))',
        label: '2) concatMap (для сохранений)',
        desc: 'Выполняет запросы сохранения строго по очереди',
      },
      {
        id: 'map(x => x + 1)',
        label: 'map(x => x + 1)',
        desc: 'Преобразует только текущее число без памяти о прошлых',
        whyWrong:
          'Не решает проблему: у map() нет аккумулятора — он не помнит предыдущее состояние счётчика.',
        wrongOut: [{ val: 'Нет памяти о прошлой сумме!', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'switchMap(a => api.save(a))',
        label: 'switchMap (для сохранений)',
        desc: 'Отменяет предыдущий запрос при новом событии',
        whyWrong:
          'Не решает проблему: для сохранения данных switchMap опасен — новое действие отменит предыдущий POST-запрос на полпути!',
        wrongOut: [{ val: 'Предыдущее сохранение отменено на полпути!', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 2,
    correctCardIds: [
      'scan((acc, x) => acc + x, 0)',
      'concatMap(a => api.save(a))',
    ],
    wrongOrderMsg:
      'В первый слот выберите scan(...) для накопления состояния, а во второй — concatMap(...) для очереди сохранений.',
    hint: 'Для накопления состояния во времени нужен scan((acc, x) => acc + x, 0), а для последовательного сохранения в эффектах — concatMap.',
  },

  11: {
    id: 11,
    code: 'ЗАДАНИЕ 11 · РАЗДЕЛ 10',
    title: 'Безопасная отписка внутри ngOnInit в Angular',
    subtitle: 'Подписка создаётся внутри ngOnInit(). Как отписаться при удалении компонента без ошибки NG0203?',
    initialMood: 'tangled',
    catProblemText: 'Вызов takeUntilDestroyed() без аргументов внутри ngOnInit() падает с ошибкой NG0203!',
    catSuccessText: 'Чисто! Мы передали this.destroyRef явно — теперь подписка аккуратно закроется вместе с компонентом.',
    sourceLabel: 'player.track$ внутри ngOnInit()',
    sourceMarbles: [
      { val: '♪ Трек 1', kind: 'event', color: '#01696f' },
      { val: '♪ Трек 2', kind: 'event', color: '#01696f' },
      { val: 'удаление компонента', kind: 'cancel', color: '#a13544' },
    ],
    expectedLabel: 'Автоматическая отписка при удалении компонента',
    expectedMarbles: [
      { val: '♪ Трек 1', kind: 'next', color: '#437a22' },
      { val: '♪ Трек 2', kind: 'next', color: '#437a22' },
      { val: 'отписано |', kind: 'cancel', color: '#437a22' },
    ],
    codePrefix: `ngOnInit() {\n  this.player.track$.pipe(`,
    codeSuffix: `).subscribe(renderTrack);\n}`,
    joinWith: '',
    cards: [
      {
        id: 'takeUntilDestroyed(this.destroyRef)',
        label: 'takeUntilDestroyed(this.destroyRef)',
        desc: 'Явно передать ссылку на DestroyRef компонента',
      },
      {
        id: 'takeUntilDestroyed()',
        label: 'takeUntilDestroyed()',
        desc: 'Вызвать без аргументов внутри ngOnInit()',
        whyWrong:
          'Не решает проблему: без аргументов takeUntilDestroyed() работает только в конструкторе или при инициализации поля. В ngOnInit() нужно явно передать this.destroyRef.',
        wrongOut: [{ val: 'Ошибка NG0203: вне контекста inject()', kind: 'error', color: '#a13544' }],
      },
      {
        id: 'take(1)',
        label: 'take(1)',
        desc: 'Получить первое значение и сразу завершить поток',
        whyWrong:
          'Не решает проблему: take(1) отключит плеер сразу после первого трека, хотя компонент ещё открыт на экране.',
        wrongOut: [
          { val: '♪ Трек 1', kind: 'next', color: '#437a22' },
          { val: 'плеер остановился слишком рано!', kind: 'error', color: '#da7101' },
        ],
      },
      {
        id: 'shareReplay(1)',
        label: 'shareReplay(1)',
        desc: 'Раздавать последнее значение подписчикам',
        whyWrong:
          'Не решает проблему: shareReplay(1) не отписывает компонент при его удалении — подписка останется висеть в памяти.',
        wrongOut: [{ val: 'Утечка памяти после закрытия экрана!', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 1,
    correctCardIds: ['takeUntilDestroyed(this.destroyRef)'],
    hint: 'В методе ngOnInit() контекст внедрения зависимостей уже недоступен автоматически — передайте сохранённый this.destroyRef в takeUntilDestroyed(this.destroyRef).',
  },

  12: {
    id: 12,
    code: 'ЗАДАНИЕ 12 · ФИНАЛЬНЫЙ ЭКЗАМЕН',
    title: 'Соберите свой оператор liveSearch',
    subtitle: 'Соберите 3 шага: пауза и отсев повторов → switchMap → retry и catchError внутри.',
    initialMood: 'error',
    catProblemText: 'Объедините подавление шума при вводе, отмену старых запросов и защиту от сбоев сети.',
    catSuccessText: 'Поздравляем! Оператор liveSearch готов к реальной работе: ждёт паузу, не дублирует запросы и не умирает при сбое.',
    sourceLabel: '"r" → "rx" (успех) → "bad" (сбой → retry → fallback)',
    sourceMarbles: [
      { val: '"r" (шум)', kind: 'event', color: '#8c8980' },
      { val: '"rx"', kind: 'event', color: '#01696f' },
      { val: '"bad"', kind: 'error', color: '#a13544' },
    ],
    expectedLabel: 'Result: rx → retry(1) → Fallback: bad',
    expectedMarbles: [
      { val: 'Result: rx', kind: 'next', color: '#437a22' },
      { val: 'retry(1)', kind: 'event', color: '#da7101' },
      { val: 'Fallback: bad', kind: 'next', color: '#437a22' },
    ],
    codePrefix: `source$.pipe(`,
    codeSuffix: `)`,
    joinWith: ', ',
    cards: [
      {
        id: 'debounceTime(300), distinctUntilChanged()',
        label: '1) debounceTime + distinctUntilChanged',
        desc: 'Подождать паузу в наборе и отсеять повтор того же текста',
      },
      {
        id: 'switchMap(q => api(q).pipe(...))',
        label: '2) switchMap(q => api(q).pipe(...))',
        desc: 'Переключиться на новый запрос и отменить устаревший',
      },
      {
        id: "retry(1), catchError(() => of('Fallback'))",
        label: '3) Внутри: retry(1) + catchError',
        desc: 'Повторить 1 раз при сбое и вернуть запасной ответ внутри switchMap',
      },
      {
        id: 'mergeMap(q => api(q)), catchError(...)',
        label: 'mergeMap + внешний catchError',
        desc: 'Запускать параллельно и ловить ошибку снаружи',
        whyWrong:
          'Не решает проблему: mergeMap приведёт к гонке ответов, а внешний catchError навсегда убьёт живой поиск при первой же сетевой ошибке.',
        wrongOut: [{ val: 'Гонка ответов и падение поиска ✕', kind: 'error', color: '#a13544' }],
      },
    ],
    slotsCount: 3,
    correctCardIds: [
      'debounceTime(300), distinctUntilChanged()',
      'switchMap(q => api(q).pipe(...))',
      "retry(1), catchError(() => of('Fallback'))",
    ],
    wrongOrderMsg:
      'Соберите шаги по порядку: 1) debounceTime + distinctUntilChanged → 2) switchMap(...) → 3) внутри запроса retry(1) + catchError.',
    hint: 'Сначала очистите входной поток (debounceTime + distinctUntilChanged), затем вызовите switchMap, а внутри него защитите запрос через retry(1) и catchError.',
  },
};

const mission = computed(() => MISSIONS[props.level] || MISSIONS[1]);

const selectedCards = ref<string[]>([]);
const feedback = ref<{ ok: boolean; msg: string } | null>(null);
const simulatedOut = ref<SimMarble[]>([]);
const showHint = ref(false);

const everSolved = computed(() => isMissionCompleted(mission.value.id));

const catCurrentMood = computed(() => {
  if (feedback.value?.ok) return 'success';
  if (feedback.value && !feedback.value.ok) return 'error';
  return mission.value.initialMood;
});

watch(
  () => props.level,
  () => {
    selectedCards.value = [];
    feedback.value = null;
    simulatedOut.value = [];
    showHint.value = false;
  }
);

function findCard(id: string): CardOption | undefined {
  return mission.value.cards.find((c) => c.id === id);
}

function evaluateCurrentSelection(requireFullSlots = false) {
  for (const id of selectedCards.value) {
    const card = findCard(id);
    if (card?.whyWrong) {
      feedback.value = { ok: false, msg: card.whyWrong };
      simulatedOut.value = card.wrongOut || [
        { val: 'Неподходящий оператор', kind: 'error', color: '#a13544' },
      ];
      return;
    }
  }

  if (selectedCards.value.length < mission.value.slotsCount) {
    if (requireFullSlots) {
      feedback.value = {
        ok: false,
        msg: `Заполнено слотов: ${selectedCards.value.length} из ${mission.value.slotsCount}. Выберите недостающие карточки ниже.`,
      };
      simulatedOut.value = [];
    } else {
      feedback.value = null;
      simulatedOut.value = [];
    }
    return;
  }

  const isExactOrder =
    selectedCards.value.length === mission.value.correctCardIds.length &&
    selectedCards.value.every((id, i) => id === mission.value.correctCardIds[i]);

  if (isExactOrder) {
    feedback.value = { ok: true, msg: mission.value.catSuccessText };
    simulatedOut.value = mission.value.expectedMarbles;
    markMissionCompleted(mission.value.id);
  } else {
    feedback.value = {
      ok: false,
      msg:
        mission.value.wrongOrderMsg ||
        'Карточки выбраны верно, но стоят в неправильном порядке. Поменяйте их местами.',
    };
    simulatedOut.value = [
      { val: 'Неверный порядок операторов', kind: 'error', color: '#da7101' },
    ];
  }
}

function toggleCard(cardId: string) {
  const existingIdx = selectedCards.value.indexOf(cardId);

  if (existingIdx >= 0) {
    selectedCards.value.splice(existingIdx, 1);
    evaluateCurrentSelection(false);
    return;
  }

  if (mission.value.slotsCount === 1) {
    selectedCards.value = [cardId];
    evaluateCurrentSelection(true);
    return;
  }

  if (selectedCards.value.length < mission.value.slotsCount) {
    selectedCards.value.push(cardId);
  } else {
    const wrongSlotIdx = selectedCards.value.findIndex(
      (id, idx) => id !== mission.value.correctCardIds[idx]
    );
    if (wrongSlotIdx >= 0) {
      selectedCards.value.splice(wrongSlotIdx, 1, cardId);
    } else {
      selectedCards.value.splice(mission.value.slotsCount - 1, 1, cardId);
    }
  }

  const clickedCard = findCard(cardId);
  if (clickedCard?.whyWrong || selectedCards.value.length === mission.value.slotsCount) {
    evaluateCurrentSelection(true);
  } else {
    evaluateCurrentSelection(false);
  }
}

function removeSlotAt(index: number) {
  if (index >= 0 && index < selectedCards.value.length) {
    selectedCards.value.splice(index, 1);
    evaluateCurrentSelection(false);
  }
}

function clearSelection() {
  selectedCards.value = [];
  feedback.value = null;
  simulatedOut.value = [];
}

function applySolution() {
  selectedCards.value = [...mission.value.correctCardIds];
  evaluateCurrentSelection(true);
}

const assembledCode = computed(() => {
  const middle =
    selectedCards.value.length > 0
      ? selectedCards.value.join(mission.value.joinWith)
      : '/* выберите карточку */';
  return `${mission.value.codePrefix}${middle}${mission.value.codeSuffix}`;
});
</script>

<template>
  <div class="quest-level">
    <div class="quest-header">
      <div class="quest-header-left">
        <div class="quest-badges">
          <span class="comet-pill comet-pill--quest">{{ mission.code }}</span>
          <span v-if="feedback?.ok || everSolved" class="solved-pill">✓ РЕШЕНО</span>
        </div>
        <h2>{{ mission.title }}</h2>
        <p class="comet-subtitle">{{ mission.subtitle }}</p>
      </div>
    </div>

    <div class="quest-arena">
      <div class="arena-visual comet-card">
        <div
          class="cat-status-box"
          :class="{
            'is-solved': feedback?.ok,
            'is-error': feedback && !feedback.ok,
          }"
        >
          <CometCat :mood="catCurrentMood" :size="72" />
          <div class="cat-speech">
            <div class="speech-tag">
              {{
                feedback?.ok
                  ? 'РЕЗУЛЬТАТ: ПОТОК РАБОТАЕТ ВЕРНО'
                  : feedback && !feedback.ok
                    ? 'ПОЧЕМУ ЭТОТ ВАРИАНТ НЕ ПОДХОДИТ'
                    : 'ЧТО СЕЙЧАС НЕ ТАК'
              }}
            </div>
            <p>
              {{ feedback ? feedback.msg : mission.catProblemText }}
            </p>
          </div>
        </div>

        <div class="conveyor-box">
          <div class="conveyor-lane">
            <span class="lane-title">Вход: {{ mission.sourceLabel }}</span>
            <div class="lane-track">
              <span
                v-for="(m, i) in mission.sourceMarbles"
                :key="i"
                class="sim-marble"
                :style="{ backgroundColor: m.color }"
              >
                {{ m.val }}
              </span>
            </div>
          </div>

          <div class="conveyor-lane">
            <span class="lane-title">Ожидаемый результат: {{ mission.expectedLabel }}</span>
            <div class="lane-track lane-track--target">
              <span
                v-for="(m, i) in mission.expectedMarbles"
                :key="i"
                class="sim-marble is-target"
                :style="{ borderColor: m.color, color: m.color }"
              >
                {{ m.val }}
              </span>
            </div>
          </div>

          <div class="conveyor-lane">
            <span class="lane-title">Что получилось на выходе:</span>
            <div class="lane-track lane-track--output">
              <span v-if="simulatedOut.length === 0" class="empty-track">
                Выберите карточку справа, чтобы увидеть результат...
              </span>
              <span
                v-for="(m, i) in simulatedOut"
                :key="i"
                class="sim-marble"
                :style="{ backgroundColor: m.color }"
              >
                {{ m.val }}
              </span>
            </div>
          </div>
        </div>

        <pre class="code-preview-box">{{ assembledCode }}</pre>
      </div>

      <div class="arena-controls comet-card">
        <div class="cards-workspace">
          <div class="slots-header">
            <span>
              Соберите ответ из карточек ({{ selectedCards.length }} / {{ mission.slotsCount }}):
            </span>
            <button
              v-if="selectedCards.length > 0"
              type="button"
              class="clear-link"
              @click="clearSelection"
            >
              Сбросить выбор
            </button>
          </div>

          <div class="pipeline-slots">
            <div
              v-for="slotIdx in mission.slotsCount"
              :key="slotIdx"
              class="pipe-slot"
              :class="{
                'is-filled': !!selectedCards[slotIdx - 1],
                'is-wrong':
                  !!selectedCards[slotIdx - 1] &&
                  (findCard(selectedCards[slotIdx - 1])?.whyWrong ||
                    (feedback && !feedback.ok)),
                'is-correct': !!selectedCards[slotIdx - 1] && feedback?.ok,
              }"
              @click="removeSlotAt(slotIdx - 1)"
            >
              <span class="slot-num">0{{ slotIdx }}</span>
              <span v-if="selectedCards[slotIdx - 1]" class="slot-val">
                {{ selectedCards[slotIdx - 1] }} <span class="slot-remove">✕</span>
              </span>
              <span v-else class="slot-placeholder">Кликните на карточку ниже...</span>
            </div>
          </div>

          <div class="deck-grid">
            <button
              v-for="c in mission.cards"
              :key="c.id"
              type="button"
              class="op-card"
              :class="{
                'is-picked': selectedCards.includes(c.id),
                'is-picked-wrong':
                  selectedCards.includes(c.id) &&
                  (!!c.whyWrong || (feedback && !feedback.ok)),
                'is-picked-ok': selectedCards.includes(c.id) && feedback?.ok,
              }"
              @click="toggleCard(c.id)"
            >
              <div class="op-card-title">{{ c.label }}</div>
              <div class="op-card-desc">{{ c.desc }}</div>
            </button>
          </div>
        </div>

        <div class="controls-footer">
          <div class="action-buttons">
            <button
              type="button"
              class="run-stream-btn"
              @click="evaluateCurrentSelection(true)"
            >
              ▶ Проверить
            </button>
            <button type="button" class="hint-btn" @click="showHint = !showHint">
              {{ showHint ? 'Скрыть подсказку' : '💡 Подсказка' }}
            </button>
            <button type="button" class="solve-btn" @click="applySolution">
              Показать ответ
            </button>
          </div>

          <div v-if="showHint" class="hint-banner">
            {{ mission.hint }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-level {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 5px;
}

.quest-level :deep(.comet-subtitle) {
  margin-bottom: 0.35rem !important;
}

.quest-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.quest-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.solved-pill {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: #e2ede6;
  color: #437a22;
  border: 1px solid rgba(67, 122, 34, 0.35);
}

.quest-arena {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.arena-visual,
.arena-controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 14px;
  gap: 6px;
}

.cat-status-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 10px;
  background: #f7f6f2;
  border: 1px solid #dcdad2;
  transition: all 0.2s ease;
}

.cat-status-box.is-solved {
  background: #e2ede6;
  border-color: rgba(67, 122, 34, 0.45);
}

.cat-status-box.is-error {
  background: #f5e1e4;
  border-color: rgba(161, 53, 68, 0.45);
}

.cat-speech {
  flex: 1;
}

.speech-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #01696f;
  margin-bottom: 2px;
}

.cat-status-box.is-error .speech-tag {
  color: #a13544;
}

.cat-status-box.is-solved .speech-tag {
  color: #437a22;
}

.cat-speech p {
  margin: 0;
  font-size: 0.81rem;
  font-weight: 600;
  color: #171614;
  line-height: 1.34;
}

.conveyor-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conveyor-lane {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lane-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #6e6c65;
  font-weight: 600;
}

.lane-track {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eceae3;
  border: 1px solid #d5d3ca;
  flex-wrap: wrap;
}

.lane-track--output {
  background: #171614;
  border-color: #3a372f;
}

.empty-track {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #9f9d96;
}

.sim-marble {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
}

.sim-marble.is-target {
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px dashed #437a22;
}

.code-preview-box {
  margin: 0;
  padding: 7px 10px;
  border-radius: 8px;
  background: #ebe9e2;
  border: 1px solid #d5d3ca;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.38;
  color: #171614;
  white-space: pre-wrap;
}

.cards-workspace {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: #6e6c65;
}

.clear-link {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: #a13544;
  cursor: pointer;
  padding: 0;
}

.clear-link:hover {
  text-decoration: underline;
}

.pipeline-slots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pipe-slot {
  flex: 1;
  min-width: 110px;
  padding: 6px 9px;
  border-radius: 8px;
  border: 1.5px dashed #b8b5ab;
  background: #f7f6f2;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pipe-slot.is-filled {
  border-style: solid;
  border-color: #01696f;
  background: #e3ece8;
  color: #01696f;
  font-weight: 700;
}

.pipe-slot.is-wrong {
  border-color: #a13544;
  background: #f5e1e4;
  color: #a13544;
}

.pipe-slot.is-correct {
  border-color: #437a22;
  background: #e2ede6;
  color: #437a22;
}

.slot-num {
  opacity: 0.55;
  font-size: 10px;
}

.slot-val {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
}

.slot-remove {
  opacity: 0.7;
  font-size: 10px;
}

.slot-placeholder {
  color: #8c8980;
  font-size: 10.5px;
}

.deck-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
}

.op-card {
  text-align: left;
  padding: 7px 10px;
  border-radius: 8px;
  background: #ffffff;
  border: 1.5px solid #dcdad2;
  cursor: pointer;
  transition: all 0.15s ease;
}

.op-card:hover {
  border-color: #01696f;
  transform: translateY(-1px);
}

.op-card.is-picked {
  background: #e3ece8;
  border-color: #01696f;
}

.op-card.is-picked-wrong {
  background: #f5e1e4;
  border-color: #a13544;
}

.op-card.is-picked-ok {
  background: #e2ede6;
  border-color: #437a22;
}

.op-card-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #01696f;
  margin-bottom: 2px;
}

.op-card.is-picked-wrong .op-card-title {
  color: #a13544;
}

.op-card.is-picked-ok .op-card-title {
  color: #437a22;
}

.op-card-desc {
  font-size: 10.8px;
  color: #57554e;
  line-height: 1.25;
}

.controls-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.run-stream-btn {
  background: #01696f;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.run-stream-btn:hover {
  background: #015459;
}

.hint-btn,
.solve-btn {
  background: #ebe9e2;
  color: #171614;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid #d5d3ca;
  cursor: pointer;
}

.solve-btn {
  margin-left: auto;
  color: #01696f;
}

.hint-banner {
  font-size: 11px;
  padding: 5px 9px;
  border-radius: 6px;
  background: #f7ebd9;
  color: #7c4000;
  border: 1px solid rgba(218, 113, 1, 0.3);
  line-height: 1.3;
}
</style>
