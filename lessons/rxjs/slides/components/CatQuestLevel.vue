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
}

interface MissionConfig {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  initialMood: 'sleeping' | 'tangled' | 'working' | 'error' | 'idle';
  catProblemText: string;
  catSuccessText: string;
  scenarioBefore: string;
  scenarioAfter: string;
  codePrefix: string;
  codeSuffix: string;
  joinWith: string;
  cards: CardOption[];
  slotsCount: number;
  correctCardIds: string[];
  wrongOrderMsg?: string;
}

const MISSIONS: Record<number, MissionConfig> = {
  1: {
    id: 1,
    code: 'КВИЗ 1 · ЗАПУСК ПОТОКА',
    title: 'Котик ждёт обед, но миска пуста',
    subtitle: 'Мы приготовили три рыбки в потоке feed$, но котик ничего не получил. Как накормить кота?',
    initialMood: 'sleeping',
    catProblemText: 'Мы просто описали поток в коде, но ещё не нажали кнопку «Пуск». Пока никто не подписался, рыбки лежат на кухне.',
    catSuccessText: 'Ура, кот сыт! Метод subscribe() запустил поток, и все три рыбки прилетели в миску.',
    scenarioBefore: '🥣 В миске пусто (поток спит)',
    scenarioAfter: '🐟 🐟 🐟 — все три порции в миске',
    codePrefix: `const feed$ = of('🐟', '🐟', '🐟');\nfeed$.`,
    codeSuffix: `;`,
    joinWith: '',
    cards: [
      {
        id: 'pipe(eat)',
        label: 'pipe(eat)',
        desc: 'Настроить цепочку правил для потока',
        whyWrong:
          'pipe() только собирает правила обработки, но сам поток не включает. Котик всё ещё ждёт обед.',
      },
      {
        id: 'subscribe(eat)',
        label: 'subscribe(eat)',
        desc: 'Подписаться на поток и получать рыбки',
      },
      {
        id: 'then(eat)',
        label: 'then(eat)',
        desc: 'Подождать результат, как в Promise',
        whyWrong:
          'Метод then() бывает у Promise, а у потоков RxJS его нет. Здесь нужен subscribe().',
      },
      {
        id: 'map(eat)',
        label: 'map(eat)',
        desc: 'Изменить каждую рыбку по дороге',
        whyWrong:
          'map() меняет значения внутри pipe(), но без подписки поток даже не стартует.',
      },
    ],
    slotsCount: 1,
    correctCardIds: ['subscribe(eat)'],
  },

  2: {
    id: 2,
    code: 'КВИЗ 2 · НАЧАЛЬНОЕ СОСТОЯНИЕ',
    title: 'Термометр в домике кота показывает прочерк',
    subtitle: 'В комнате уже +22°C. Какой поток сразу покажет эту температуру, как только мы откроем приложение?',
    initialMood: 'tangled',
    catProblemText: 'Обычный Subject молчит, пока температура не изменится. А нам нужно видеть текущие +22°C сразу при входе.',
    catSuccessText: 'Точно! BehaviorSubject(22) хранит текущую температуру и сразу отдаёт её каждому новому экрану.',
    scenarioBefore: '🌡️ На экране пусто до следующего замера',
    scenarioAfter: '🌡️ Сразу показывает +22°C, затем +24°C',
    codePrefix: `const temp$ = new `,
    codeSuffix: `;\ntemp$.subscribe(showOnScreen);`,
    joinWith: '',
    cards: [
      {
        id: 'Subject()',
        label: 'Subject()',
        desc: 'Передаёт только новые события после подписки',
        whyWrong:
          'Обычный Subject не помнит прошлое значение. Экран останется пустым, пока датчик не пришлёт новую цифру.',
      },
      {
        id: 'BehaviorSubject(22)',
        label: 'BehaviorSubject(22)',
        desc: 'Хранит текущее значение и отдаёт его сразу',
      },
      {
        id: 'of(22)',
        label: 'of(22)',
        desc: 'Выдать число 22 один раз и закрыться',
        whyWrong:
          'of(22) сразу завершится, и мы не сможем отправлять в него новые замеры через .next(24).',
      },
      {
        id: 'Observable()',
        label: 'Observable()',
        desc: 'Базовый поток без метода next снаружи',
        whyWrong:
          'У обычного Observable нет метода .next() снаружи и он не хранит состояние.',
      },
    ],
    slotsCount: 1,
    correctCardIds: ['BehaviorSubject(22)'],
  },

  3: {
    id: 3,
    code: 'КВИЗ 3 · СОЗДАНИЕ И ЛИМИТ',
    title: 'Выдать коту только 3 вкусняшки по одной',
    subtitle: 'В пачке лежит массив из 5 кусочков. Нужно доставать их по одному и остановиться после третьего.',
    initialMood: 'tangled',
    catProblemText: 'Если кинуть пачку через of(), в миску упадёт вся коробка целиком. А без лимита кот съест лишнее.',
    catSuccessText: 'Отлично! from(items) достаёт кусочки по одному, а take(3) вовремя закрывает пачку.',
    scenarioBefore: '📦 Вся пачка из 5 штук высыпалась разом',
    scenarioAfter: '🐟 → 🍤 → 🥩 (ровно 3 штуки по очереди)',
    codePrefix: `const items = ['🐟', '🍤', '🥩', '🦴', '🥦'];\n`,
    codeSuffix: `.subscribe(giveTreat);`,
    joinWith: '.',
    cards: [
      {
        id: 'of(items)',
        label: 'of(items)',
        desc: 'Отправить весь массив одним куском',
        whyWrong:
          'of(items) не разбирает массив на элементы, а кидает весь список за один раз.',
      },
      {
        id: 'from(items)',
        label: 'from(items)',
        desc: 'Доставать элементы из массива по одному',
      },
      {
        id: 'pipe(filter(3))',
        label: 'pipe(filter(3))',
        desc: 'Проверять каждый элемент условием',
        whyWrong:
          'filter() ждёт функцию-проверку и не умеет отсчитывать первые 3 элемента.',
      },
      {
        id: 'pipe(take(3))',
        label: 'pipe(take(3))',
        desc: 'Взять первые 3 штуки и закрыть поток',
      },
    ],
    slotsCount: 2,
    correctCardIds: ['from(items)', 'pipe(take(3))'],
    wrongOrderMsg:
      'Сначала нужно создать поток из массива через from(items), а вторым шагом ограничить его через pipe(take(3)).',
  },

  4: {
    id: 4,
    code: 'КВИЗ 4 · КОНВЕЙЕР PIPE()',
    title: 'Очистить ленту от дублей и костей перед сервировкой',
    subtitle: 'Соберите 3 шага по порядку: убрать повторы подряд → выкинуть кости 🦴 → украсить блюдо ✨.',
    initialMood: 'working',
    catProblemText: 'Если сначала украшать всё подряд через map(), то кость 🦴 превратится в ✨🦴 и проскочит мимо фильтра!',
    catSuccessText: 'Идеальный порядок! Сначала убрали дубли и кости, и только хорошие порции украсили в map().',
    scenarioBefore: '🐟 → 🐟 → 🦴 → 🍤',
    scenarioAfter: '✨🐟 → ✨🍤 (без дублей и костей)',
    codePrefix: `belt$.pipe(\n  `,
    codeSuffix: `\n).subscribe(serve);`,
    joinWith: ',\n  ',
    cards: [
      {
        id: "filter(x => x !== '🦴')",
        label: "filter(x => x !== '🦴')",
        desc: 'Пропустить дальше только съедобное',
      },
      {
        id: 'distinctUntilChanged()',
        label: 'distinctUntilChanged()',
        desc: 'Убрать идущие подряд одинаковые порции',
      },
      {
        id: "tap(x => '✨' + x)",
        label: "tap(x => '✨' + x)",
        desc: 'Просто посмотреть на элемент без изменений',
        whyWrong:
          'tap() не меняет значения в потоке — то, что вы из него вернули, просто игнорируется.',
      },
      {
        id: "map(x => '✨' + x)",
        label: "map(x => '✨' + x)",
        desc: 'Украсить порцию перед подачей на стол',
      },
    ],
    slotsCount: 3,
    correctCardIds: [
      'distinctUntilChanged()',
      "filter(x => x !== '🦴')",
      "map(x => '✨' + x)",
    ],
    wrongOrderMsg:
      'Проверьте порядок: сначала убираем повторы (distinctUntilChanged), затем фильтруем кости (filter), и только в конце вызываем map.',
  },

  5: {
    id: 5,
    code: 'КВИЗ 5 · УПРАВЛЕНИЕ ЗАПРОСАМИ',
    title: 'Два сценария: строка поиска и кнопка «Оплатить»',
    subtitle: 'В первый слот выберите оператор для живого поиска, а во второй — для защиты кнопки оплаты от двойного клика.',
    initialMood: 'tangled',
    catProblemText: 'В поиске нужно отменять старый запрос при вводе новой буквы, а при оплате — блокировать случайный второй клик.',
    catSuccessText: 'В точку! switchMap отменяет устаревшие поиски, а exhaustMap игнорирует повторные клики, пока идёт оплата.',
    scenarioBefore: 'Гонка ответов в поиске и двойное списание денег',
    scenarioAfter: 'Поиск показывает свежий ответ, заказ оплачен 1 раз',
    codePrefix: `// 1. Живой поиск, 2. Кнопка оплаты:\n`,
    codeSuffix: ``,
    joinWith: '\n',
    cards: [
      {
        id: 'mergeMap(req)',
        label: 'mergeMap(req)',
        desc: 'Запускать все запросы параллельно без ограничений',
        whyWrong:
          'mergeMap не отменяет старый поиск и не блокирует повторный клик по кнопке оплаты — деньги спишутся дважды.',
      },
      {
        id: 'switchMap(req)',
        label: 'switchMap(req)',
        desc: 'Отменять предыдущий запрос, когда пришло новое событие',
      },
      {
        id: 'concatMap(req)',
        label: 'concatMap(req)',
        desc: 'Ставить каждый клик в строгую очередь друг за другом',
        whyWrong:
          'concatMap поставит второй клик по кнопке оплаты в очередь и спишет деньги второй раз сразу после первого запроса.',
      },
      {
        id: 'exhaustMap(req)',
        label: 'exhaustMap(req)',
        desc: 'Игнорировать новые события, пока текущий запрос не завершился',
      },
    ],
    slotsCount: 2,
    correctCardIds: ['switchMap(req)', 'exhaustMap(req)'],
    wrongOrderMsg:
      'Поменяйте карточки местами: в первом слоте должен быть оператор для поиска (switchMap), а во втором — для кнопки оплаты (exhaustMap).',
  },

  6: {
    id: 6,
    code: 'КВИЗ 6 · ОБЪЕДИНЕНИЕ ПОТОКОВ',
    title: 'Сначала данные из кеша, а следом — с сервера',
    subtitle: 'В первый слот выберите поочерёдный запуск cache$ и server$, а во второй — стартовое значение для фильтра.',
    initialMood: 'tangled',
    catProblemText: 'Нам важно соблюсти строгую очередь «сначала кеш, потом сервер» и сделать так, чтобы combineLatest не ждал ручного ввода.',
    catSuccessText: 'Верно! concat(cache$, server$) запускает потоки строго по очереди, а startWith("") сразу будит фильтр.',
    scenarioBefore: 'Экран ждёт ввода пользователя и путает порядок ответов',
    scenarioAfter: 'Мгновенно показан кеш → затем сервер, фильтр работает со старта',
    codePrefix: `// 1. Очередь потоков, 2. Старт фильтра:\n`,
    codeSuffix: ``,
    joinWith: '\n',
    cards: [
      {
        id: 'merge(cache$, server$)',
        label: 'merge(cache$, server$)',
        desc: 'Запустить оба потока одновременно наперегонки',
        whyWrong:
          'merge() не гарантирует порядок: если чтение кеша чуть задержится, старый кеш затрёт свежий ответ сервера.',
      },
      {
        id: 'concat(cache$, server$)',
        label: 'concat(cache$, server$)',
        desc: 'Подписаться на второй поток строго после завершения первого',
      },
      {
        id: "startWith('')",
        label: "startWith('')",
        desc: 'Выдать начальную пустую строку сразу при подписке',
      },
      {
        id: 'forkJoin([cache$, server$])',
        label: 'forkJoin([cache$, server$])',
        desc: 'Ждать завершения всех потоков перед первым выводом',
        whyWrong:
          'forkJoin будет ждать медленный сервер и не покажет быстрый кеш заранее.',
      },
    ],
    slotsCount: 2,
    correctCardIds: ['concat(cache$, server$)', "startWith('')"],
    wrongOrderMsg:
      'В первый слот поставьте объединение cache$ и server$ (concat), а во второй — начальное значение фильтра (startWith).',
  },

  7: {
    id: 7,
    code: 'КВИЗ 7 · ГЛАВНЫЙ И ФОНОВЫЙ ПОТОК',
    title: 'Отправлять форму только по клику кнопки «Сохранить»',
    subtitle: 'В фоне меняется поток роли пользователя role$. Как брать текущую роль, но сохранять только в момент клика?',
    initialMood: 'tangled',
    catProblemText: 'Если взять combineLatest, то форма начнёт сама сохраняться при каждой фоновой смене роли без ведома пользователя!',
    catSuccessText: 'Точно! withLatestFrom(role$) реагирует только на клик кнопки и просто подсматривает текущую роль.',
    scenarioBefore: 'Ложные сохранения при каждом изменении role$',
    scenarioAfter: 'Запрос уходит строго по клику кнопки',
    codePrefix: `saveClick$.pipe(\n  `,
    codeSuffix: `,\n  map(([click, role]) => save(role))\n)`,
    joinWith: '',
    cards: [
      {
        id: 'combineLatest([role$])',
        label: 'combineLatest([role$])',
        desc: 'Срабатывать при любом изменении в любом из потоков',
        whyWrong:
          'В combineLatest оба потока главные: как только в фоне обновится роль, форма сохранится сама без клика!',
      },
      {
        id: 'withLatestFrom(role$)',
        label: 'withLatestFrom(role$)',
        desc: 'Ждать события от главного потока и брать последнее значение второго',
      },
      {
        id: 'merge(role$)',
        label: 'merge(role$)',
        desc: 'Свалить события кликов и смены ролей в одну общую кучу',
        whyWrong:
          'merge() просто смешивает события по очереди, а нам нужно соединить клик с текущей ролью.',
      },
      {
        id: 'forkJoin([role$])',
        label: 'forkJoin([role$])',
        desc: 'Ждать полного закрытия обоих потоков',
        whyWrong:
          'Кнопка сохранения не закрывается после первого клика, поэтому forkJoin вообще ничего не выдаст.',
      },
    ],
    slotsCount: 1,
    correctCardIds: ['withLatestFrom(role$)'],
  },

  8: {
    id: 8,
    code: 'КВИЗ 8 · ЗАЩИТА ОТ ОШИБОК',
    title: 'После одной ошибки сети строка поиска перестала работать',
    subtitle: 'Сервер один раз ответил ошибкой 500, и теперь поле поиска вообще не реагирует на новый ввод текста. Как починить?',
    initialMood: 'error',
    catProblemText: 'По правилам RxJS ошибка убивает тот поток, в котором произошла. Если ошибка вылетела наружу, закрывается весь поток ввода!',
    catSuccessText: 'Спасено! Когда catchError стоит внутри switchMap, он гасит сбой конкретного HTTP-запроса, а строка поиска продолжает жить.',
    scenarioBefore: 'Одна ошибка 500 навсегда ломает поиск',
    scenarioAfter: 'Сбой обработан, поиск работает дальше',
    codePrefix: `searchText$.pipe(\n  `,
    codeSuffix: `\n)`,
    joinWith: '',
    cards: [
      {
        id: 'switchMap(q => api(q)), catchError(() => of([]))',
        label: 'catchError снаружи switchMap',
        desc: 'Ловить ошибку в общем пайпе после switchMap',
        whyWrong:
          'Если ошибка вышла из switchMap во внешний поток searchText$, то весь поиск завершится и больше не оживёт.',
      },
      {
        id: 'switchMap(q => api(q).pipe(catchError(() => of([]))))',
        label: 'catchError внутри switchMap',
        desc: 'Ловить ошибку прямо на внутреннем запросе api(q)',
      },
      {
        id: 'tap({ error: console.error })',
        label: 'tap({ error: console.error })',
        desc: 'Вывести ошибку в консоль',
        whyWrong:
          'tap() только печатает ошибку в консоль, но не останавливает падение потока.',
      },
      {
        id: 'finalize(() => stopSpinner())',
        label: 'finalize(() => stopSpinner())',
        desc: 'Выключить спиннер при закрытии потока',
        whyWrong:
          'finalize() приберётся после падения, но не спасёт поток от закрытия при ошибке.',
      },
    ],
    slotsCount: 1,
    correctCardIds: ['switchMap(q => api(q).pipe(catchError(() => of([]))))'],
  },

  9: {
    id: 9,
    code: 'КВИЗ 9 · КЕШИРОВАНИЕ ЗАПРОСОВ',
    title: 'Три компонента запрашивают один и тот же конфиг',
    subtitle: 'Шапка, меню и подвал подписались на config$. Как сделать так, чтобы в сеть ушёл только 1 запрос, а ответ сохранился в кеше?',
    initialMood: 'tangled',
    catProblemText: 'По умолчанию каждый вызов subscribe() запускает новый HTTP-запрос. А обычный share() сбрасывается после завершения запроса.',
    catSuccessText: 'Красота! shareReplay(1) делает один запрос на всех и бережно хранит полученный ответ для тех, кто подпишется позже.',
    scenarioBefore: '3 подписки = 3 одинаковых запроса в сеть',
    scenarioAfter: '1 запрос в сеть, остальные берут ответ из кеша',
    codePrefix: `config$ = this.http.get('/api/config').pipe(\n  `,
    codeSuffix: `\n);`,
    joinWith: '',
    cards: [
      {
        id: 'share()',
        label: 'share()',
        desc: 'Делить поток, пока запрос выполняется, без хранения ответа',
        whyWrong:
          'HTTP-запрос завершается мгновенно. Кто подпишется на секунду позже — с обычным share() запустит новый запрос.',
      },
      {
        id: 'shareReplay({ bufferSize: 1, refCount: true })',
        label: 'shareReplay({ bufferSize: 1, refCount: true })',
        desc: 'Выполнить запрос 1 раз и раздавать сохранённый ответ всем подписчикам',
      },
      {
        id: 'distinctUntilChanged()',
        label: 'distinctUntilChanged()',
        desc: 'Отсеивать одинаковые значения подряд',
        whyWrong:
          'distinctUntilChanged фильтрует значения внутри одной подписки, но не объединяет разные подписки между собой.',
      },
      {
        id: 'take(1)',
        label: 'take(1)',
        desc: 'Взять только первое значение и закрыться',
        whyWrong:
          'take(1) не кеширует ответ между разными компонентами — каждый компонент всё равно вызовет свой HTTP-запрос.',
      },
    ],
    slotsCount: 1,
    correctCardIds: ['shareReplay({ bufferSize: 1, refCount: true })'],
  },

  10: {
    id: 10,
    code: 'КВИЗ 10 · СОСТОЯНИЕ И ЭФФЕКТЫ',
    title: 'Счётчик корзины и поочерёдное сохранение на сервер',
    subtitle: 'Слот 1: накапливать сумму товаров после каждого клика. Слот 2: отправлять сохранения на сервер строго по очереди.',
    initialMood: 'working',
    catProblemText: 'Обычный map() не помнит прошлую сумму корзины, а switchMap отменит предыдущее сохранение на полпути.',
    catSuccessText: 'Собрано! scan() помнит и обновляет сумму на каждом шаге, а concatMap аккуратно сохраняет изменения по очереди.',
    scenarioBefore: 'Сумма не копится, сохранения перебивают друг друга',
    scenarioAfter: 'Корзина считает итог, запросы идут строго по очереди',
    codePrefix: `// 1. Накопление суммы, 2. Очередь сохранений:\n`,
    codeSuffix: ``,
    joinWith: '\n',
    cards: [
      {
        id: 'map(price => price)',
        label: 'map(price => price)',
        desc: 'Преобразовать текущее число без памяти о прошлых шагах',
        whyWrong:
          'У map() нет памяти о предыдущем состоянии — он не может складывать товары в общую сумму.',
      },
      {
        id: 'scan((sum, price) => sum + price, 0)',
        label: 'scan((sum, price) => sum + price, 0)',
        desc: 'Прибавлять новое значение к накопленной сумме и сразу отдавать итог',
      },
      {
        id: 'switchMap(item => api.save(item))',
        label: 'switchMap(item => api.save(item))',
        desc: 'Отменять прошлое сохранение при новом действии',
        whyWrong:
          'В сохранении данных отменять предыдущий запрос нельзя — часть изменений просто потеряется.',
      },
      {
        id: 'concatMap(item => api.save(item))',
        label: 'concatMap(item => api.save(item))',
        desc: 'Ждать завершения текущего сохранения перед отправкой следующего',
      },
    ],
    slotsCount: 2,
    correctCardIds: [
      'scan((sum, price) => sum + price, 0)',
      'concatMap(item => api.save(item))',
    ],
    wrongOrderMsg:
      'В первый слот поставьте оператор накопления суммы (scan), а во второй — оператор очереди сохранений (concatMap).',
  },

  11: {
    id: 11,
    code: 'КВИЗ 11 · RXJS В ANGULAR',
    title: 'Автоматическая отписка внутри метода ngOnInit()',
    subtitle: 'Мы подписываемся на плеер внутри ngOnInit(). Как привязать отписку к удалению компонента и не получить ошибку NG0203?',
    initialMood: 'tangled',
    catProblemText: 'Внутри ngOnInit() Angular уже не даёт вызвать takeUntilDestroyed() с пустыми скобками — нужна ссылка на DestroyRef.',
    catSuccessText: 'Чисто! Передали this.destroyRef — теперь при закрытии компонента подписка остановится сама.',
    scenarioBefore: 'Ошибка NG0203 или забытая в памяти подписка',
    scenarioAfter: 'Безопасная авто-отписка при удалении компонента',
    codePrefix: `ngOnInit() {\n  this.player.track$.pipe(\n    `,
    codeSuffix: `\n  ).subscribe(play);\n}`,
    joinWith: '',
    cards: [
      {
        id: 'takeUntilDestroyed()',
        label: 'takeUntilDestroyed()',
        desc: 'Вызвать без аргументов прямо внутри ngOnInit()',
        whyWrong:
          'Без аргументов этот оператор работает только в конструкторе. В ngOnInit() он упадёт с ошибкой NG0203.',
      },
      {
        id: 'takeUntilDestroyed(this.destroyRef)',
        label: 'takeUntilDestroyed(this.destroyRef)',
        desc: 'Передать сохранённый в поле класса this.destroyRef',
      },
      {
        id: 'take(1)',
        label: 'take(1)',
        desc: 'Остановить поток сразу после первой песни',
        whyWrong:
          'take(1) отключит плеер после первого же трека, хотя пользователь никуда не уходил со страницы.',
      },
      {
        id: 'share()',
        label: 'share()',
        desc: 'Сделать поток общим для нескольких подписчиков',
        whyWrong:
          'share() не отписывает компонент при уходе со страницы.',
      },
    ],
    slotsCount: 1,
    correctCardIds: ['takeUntilDestroyed(this.destroyRef)'],
  },

  12: {
    id: 12,
    code: 'КВИЗ 12 · ФИНАЛЬНАЯ СБОРКА',
    title: 'Соберите надёжный живой поиск из 3 частей',
    subtitle: 'Разложите шаги по порядку: 1) пауза и отсев дублей → 2) переключение запроса → 3) повтор и защита от падения внутри.',
    initialMood: 'error',
    catProblemText: 'Нужно собрать всю цепочку: не спамить сервер на каждую букву, отменять старые запросы и не падать при ошибке сети.',
    catSuccessText: 'Блестяще! Вы собрали продакшен-оператор liveSearch: быстрый, экономный и неубиваемый.',
    scenarioBefore: 'Лишние запросы, гонка ответов и падение при сбое',
    scenarioAfter: 'Пауза 300 мс → отмена старого → retry + catchError внутри',
    codePrefix: `input$.pipe(\n  `,
    codeSuffix: `\n)`,
    joinWith: ',\n  ',
    cards: [
      {
        id: 'switchMap(q => api(q).pipe(...))',
        label: 'switchMap(q => api(q).pipe(...))',
        desc: 'Отменять прошлый запрос и переключаться на новый',
      },
      {
        id: 'debounceTime(300), distinctUntilChanged()',
        label: 'debounceTime(300), distinctUntilChanged()',
        desc: 'Подождать паузу при вводе и отсеять повтор того же слова',
      },
      {
        id: 'mergeMap(q => api(q)), catchError(...)',
        label: 'mergeMap + внешний catchError',
        desc: 'Запускать параллельно и ловить ошибку снаружи',
        whyWrong:
          'mergeMap создаст гонку ответов, а внешний catchError навсегда отключит строку поиска после первого сбоя.',
      },
      {
        id: "retry(1), catchError(() => of([]))",
        label: 'retry(1), catchError(() => of([]))',
        desc: 'Внутри запроса: повторить при сбое и вернуть пустой список',
      },
    ],
    slotsCount: 3,
    correctCardIds: [
      'debounceTime(300), distinctUntilChanged()',
      'switchMap(q => api(q).pipe(...))',
      'retry(1), catchError(() => of([]))',
    ],
    wrongOrderMsg:
      'Проверьте порядок: 1) сначала пауза и дубли (debounceTime + distinctUntilChanged), 2) затем switchMap, 3) внутри него retry + catchError.',
  },
};

const mission = computed(() => MISSIONS[props.level] || MISSIONS[1]);

const selectedCards = ref<string[]>([]);
const feedback = ref<{ ok: boolean; msg: string } | null>(null);

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
  }
);

function findCard(id: string): CardOption | undefined {
  return mission.value.cards.find((c) => c.id === id);
}

function evaluateCurrentSelection() {
  for (const id of selectedCards.value) {
    const card = findCard(id);
    if (card?.whyWrong) {
      feedback.value = { ok: false, msg: card.whyWrong };
      return;
    }
  }

  if (selectedCards.value.length < mission.value.slotsCount) {
    feedback.value = null;
    return;
  }

  const isExactOrder =
    selectedCards.value.length === mission.value.correctCardIds.length &&
    selectedCards.value.every((id, i) => id === mission.value.correctCardIds[i]);

  if (isExactOrder) {
    feedback.value = { ok: true, msg: mission.value.catSuccessText };
    markMissionCompleted(mission.value.id);
  } else {
    feedback.value = {
      ok: false,
      msg:
        mission.value.wrongOrderMsg ||
        'Карточки выбраны правильные, но стоят не в том порядке. Попробуйте поменять их местами.',
    };
  }
}

function toggleCard(cardId: string) {
  const existingIdx = selectedCards.value.indexOf(cardId);

  if (existingIdx >= 0) {
    selectedCards.value.splice(existingIdx, 1);
    evaluateCurrentSelection();
    return;
  }

  if (mission.value.slotsCount === 1) {
    selectedCards.value = [cardId];
    evaluateCurrentSelection();
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

  evaluateCurrentSelection();
}

function removeSlotAt(index: number) {
  if (index >= 0 && index < selectedCards.value.length) {
    selectedCards.value.splice(index, 1);
    evaluateCurrentSelection();
  }
}

function clearSelection() {
  selectedCards.value = [];
  feedback.value = null;
}

const assembledCode = computed(() => {
  const middle =
    selectedCards.value.length > 0
      ? selectedCards.value.join(mission.value.joinWith)
      : '/* выберите вариант справа */';
  return `${mission.value.codePrefix}${middle}${mission.value.codeSuffix}`;
});
</script>

<template>
  <div class="quest-level">
    <div class="quest-header">
      <div class="quest-badges">
        <span class="comet-pill comet-pill--quest">{{ mission.code }}</span>
        <span v-if="feedback?.ok || everSolved" class="solved-pill">✓ РЕШЕНО</span>
      </div>
      <h2>{{ mission.title }}</h2>
      <p class="comet-subtitle">{{ mission.subtitle }}</p>
    </div>

    <div class="quest-arena">
      <!-- Левая колонка: Кот + короткая суть + превью кода -->
      <div class="arena-visual comet-card">
        <div
          class="cat-status-box"
          :class="{
            'is-solved': feedback?.ok,
            'is-error': feedback && !feedback.ok,
          }"
        >
          <CometCat :mood="catCurrentMood" :size="76" />
          <div class="cat-speech">
            <div class="speech-tag">
              {{
                feedback?.ok
                  ? 'ОТЛИЧНО! ВСЁ РАБОТАЕТ'
                  : feedback && !feedback.ok
                    ? 'ПОЧЕМУ ЭТО НЕ ПОДОЙДЁТ'
                    : 'СИТУАЦИЯ'
              }}
            </div>
            <p>
              {{ feedback ? feedback.msg : mission.catProblemText }}
            </p>
          </div>
        </div>

        <div class="summary-boxes">
          <div class="summary-row before">
            <span class="sum-label">Без решения:</span>
            <span class="sum-val">{{ mission.scenarioBefore }}</span>
          </div>
          <div class="summary-row after" :class="{ active: feedback?.ok }">
            <span class="sum-label">Наша цель:</span>
            <span class="sum-val">{{ mission.scenarioAfter }}</span>
          </div>
        </div>

        <pre class="code-preview-box">{{ assembledCode }}</pre>
      </div>

      <!-- Правая колонка: Слоты и карточки вариантов -->
      <div class="arena-controls comet-card">
        <div class="slots-header">
          <span>
            {{
              mission.slotsCount === 1
                ? 'Нажмите на подходящий вариант:'
                : `Выберите карточки по порядку (${selectedCards.length} из ${mission.slotsCount}):`
            }}
          </span>
          <button
            v-if="selectedCards.length > 0"
            type="button"
            class="clear-link"
            @click="clearSelection"
          >
            Сбросить
          </button>
        </div>

        <div v-if="mission.slotsCount > 1" class="pipeline-slots">
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
            <span class="slot-num">Шаг {{ slotIdx }}</span>
            <span v-if="selectedCards[slotIdx - 1]" class="slot-val">
              {{ selectedCards[slotIdx - 1] }} <span class="slot-remove">✕</span>
            </span>
            <span v-else class="slot-placeholder">Пустой слот...</span>
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
    </div>
  </div>
</template>

<style scoped>
.quest-level {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.quest-level :deep(.comet-subtitle) {
  margin-bottom: 0.25rem !important;
}

.quest-header {
  display: flex;
  flex-direction: column;
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.arena-visual,
.arena-controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 15px;
  gap: 10px;
}

.cat-status-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f6f2;
  border: 1.5px solid #dcdad2;
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
  margin-bottom: 3px;
}

.cat-status-box.is-error .speech-tag {
  color: #a13544;
}

.cat-status-box.is-solved .speech-tag {
  color: #437a22;
}

.cat-speech p {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 600;
  color: #171614;
  line-height: 1.38;
}

.summary-boxes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  background: #f2f1ec;
  border: 1px solid #dcdad2;
}

.summary-row.after.active {
  background: #e2ede6;
  border-color: #437a22;
  color: #2f5e16;
  font-weight: 600;
}

.sum-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #6e6c65;
  flex-shrink: 0;
}

.sum-val {
  text-align: right;
}

.code-preview-box {
  margin: 0;
  padding: 8px 11px;
  border-radius: 8px;
  background: #ebe9e2;
  border: 1px solid #d5d3ca;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.4;
  color: #171614;
  white-space: pre-wrap;
  word-break: break-word;
}

.slots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #57554e;
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
  opacity: 0.6;
  font-size: 10px;
  flex-shrink: 0;
}

.slot-val {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
  justify-content: center;
}

.op-card {
  text-align: left;
  padding: 8px 12px;
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
  font-size: 11.5px;
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
  font-size: 11.2px;
  color: #57554e;
  line-height: 1.3;
}
</style>
