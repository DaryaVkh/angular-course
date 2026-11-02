<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue';

export type MiniAppScenario =
  | 'events-timeline'
  | 'book-search'
  | 'signals-profile'
  | 'player-leak'
  | 'of-vs-from'
  | 'promo-timer'
  | 'pipe-catalog'
  | 'start-with-profile'
  | 'distinct-tabs'
  | 'debounce-search'
  | 'ho-switch'
  | 'ho-merge'
  | 'ho-concat'
  | 'ho-exhaust'
  | 'upload-limit'
  | 'combine-filters'
  | 'with-latest-save'
  | 'forkjoin-assets'
  | 'scan-cart';

const props = defineProps<{
  scenario: MiniAppScenario;
}>();

interface LogEntry {
  id: number;
  tag: string;
  text: string;
  tone: 'teal' | 'green' | 'orange' | 'red' | 'blue' | 'gray';
}

const logs = ref<LogEntry[]>([]);
let logCounter = 0;

function addLog(tag: string, text: string, tone: LogEntry['tone'] = 'teal') {
  logs.value.unshift({ id: ++logCounter, tag, text, tone });
  if (logs.value.length > 4) {
    logs.value.pop();
  }
}

function clearTimers() {
  activeTimers.forEach((t) => clearTimeout(t));
  activeTimers = [];
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

let activeTimers: ReturnType<typeof setTimeout>[] = [];
let intervalRef: ReturnType<typeof setInterval> | null = null;

onBeforeUnmount(() => {
  clearTimers();
});

// ================= 1. events-timeline =================
const etLikes = ref(12);
const etQuery = ref('');
const etServerStatus = ref<'idle' | 'loading' | 'done'>('idle');

function etClickLike() {
  etLikes.value++;
  addLog('click$', `Лайк поставлен (всего: ${etLikes.value})`, 'teal');
}

function etTypeSearch(q: string) {
  etQuery.value = q;
  etServerStatus.value = 'loading';
  addLog('input$', `Ввели «${q}» → ждём сервер...`, 'blue');
  clearTimers();
  const t = setTimeout(() => {
    etServerStatus.value = 'done';
    addLog('http$', `Сервер вернул товары по запросу «${q}»`, 'green');
  }, 600);
  activeTimers.push(t);
}

// ================= 2. book-search =================
const bsInput = ref('');
const bsStep = ref<0 | 1 | 2 | 3 | 4>(0);
const bsBooks = ref<{ title: string; price: string; tag: string }[]>([]);

const BOOK_DB: Record<string, { title: string; price: string; tag: string }[]> = {
  rx: [
    { title: 'RxJS в действии', price: '1 290 ₽', tag: 'Хит' },
    { title: 'Реактивный Angular', price: '1 450 ₽', tag: 'Новинка' },
  ],
  ng: [
    { title: 'Angular Pro', price: '1 690 ₽', tag: 'Хит' },
    { title: 'Архитектура SPA', price: '1 190 ₽', tag: 'База' },
  ],
  ts: [
    { title: 'TypeScript глубоко', price: '1 350 ₽', tag: 'Практика' },
    { title: 'Типы без боли', price: '990 ₽', tag: 'Обзор' },
  ],
};

function runBookSearch(term: string) {
  clearTimers();
  bsInput.value = term;
  bsStep.value = 1;
  addLog('input$', `Печатаем «${term}» — ждём паузу 300 мс`, 'blue');

  const t1 = setTimeout(() => {
    bsStep.value = 2;
    addLog('debounceTime', 'Пауза 300 мс прошла — текст не менялся', 'orange');

    const t2 = setTimeout(() => {
      bsStep.value = 3;
      addLog('switchMap', `GET /api/books?q=${term}`, 'teal');

      const t3 = setTimeout(() => {
        bsStep.value = 4;
        bsBooks.value = BOOK_DB[term] || BOOK_DB.rx;
        addLog('subscribe', `Отрисовано книг: ${bsBooks.value.length}`, 'green');
      }, 450);
      activeTimers.push(t3);
    }, 350);
    activeTimers.push(t2);
  }, 350);
  activeTimers.push(t1);
}

// ================= 3. signals-profile =================
const spState = ref<'idle' | 'loading' | 'ok' | 'error'>('idle');
const spCompleted = ref(false);

function runProfileSignal(mode: 'ok' | 'error') {
  clearTimers();
  spState.value = 'loading';
  spCompleted.value = false;
  addLog('subscribe()', 'Запрос профиля отправлен...', 'blue');

  const t = setTimeout(() => {
    if (mode === 'ok') {
      spState.value = 'ok';
      spCompleted.value = true;
      addLog('next(user)', 'Пришёл профиль @alex_dev', 'teal');
      addLog('complete()', 'Поток успешно закрыт (|)', 'green');
    } else {
      spState.value = 'error';
      spCompleted.value = false;
      addLog('error(500)', 'Сервер недоступен! Поток аварийно закрыт (✕)', 'red');
    }
  }, 450);
  activeTimers.push(t);
}

// ================= 4. player-leak =================
const plOpen = ref(false);
const plSec = ref(0);
const plZombieSec = ref(0);
const plSafeMode = ref(false);

function startPlayer(safe: boolean) {
  clearTimers();
  plSafeMode.value = safe;
  plOpen.value = true;
  plSec.value = 0;
  plZombieSec.value = 0;
  addLog('subscribe', safe ? 'Плеер открыт (с takeUntilDestroyed)' : 'Плеер открыт (без отписки)', 'teal');

  intervalRef = setInterval(() => {
    if (plOpen.value) {
      plSec.value++;
    } else if (!plSafeMode.value) {
      plZombieSec.value++;
      addLog('утечка!', `Зомби-тик #${plZombieSec.value}: компонент удалён, а таймер крутится`, 'red');
    }
  }, 700);
}

function closePlayer() {
  plOpen.value = false;
  if (plSafeMode.value) {
    clearTimers();
    addLog('unsubscribe()', 'Плеер закрыт — поток сразу остановлен', 'green');
  } else {
    addLog('забыли отписку', 'Экран закрыли, но таймер продолжает работать в фоне!', 'orange');
  }
}

// ================= 5. of-vs-from =================
const ofResult = ref<string[]>([]);
const ofMode = ref<'of' | 'from' | null>(null);

function runOfVsFrom(mode: 'of' | 'from') {
  clearTimers();
  ofResult.value = [];
  ofMode.value = mode;
  const items = ['📱 Смартфон', '🎧 Наушники', '⌚ Часы'];

  if (mode === 'of') {
    ofResult.value = [JSON.stringify(items)];
    addLog('of(items)', 'Пришёл 1 вызов next() со всем массивом сразу', 'orange');
  } else {
    items.forEach((item, idx) => {
      const t = setTimeout(() => {
        ofResult.value.push(item);
        addLog(`from: шаг ${idx + 1}`, `next("${item}") — элемент отдельно`, 'teal');
      }, idx * 350);
      activeTimers.push(t);
    });
  }
}

// ================= 6. promo-timer =================
const ptStep = ref(3);
const ptStatus = ref<'idle' | 'running' | 'done'>('idle');

function startPromoCountdown() {
  clearTimers();
  ptStep.value = 3;
  ptStatus.value = 'running';
  addLog('interval(1000)', 'Запустили обратный отсчёт из 3 шагов: take(3)', 'teal');

  intervalRef = setInterval(() => {
    ptStep.value--;
    if (ptStep.value > 0) {
      addLog('next()', `Осталось секунд: ${ptStep.value}`, 'blue');
    } else {
      clearTimers();
      ptStatus.value = 'done';
      addLog('complete()', 'take(3) отсчитал 3 шага и сам выключил таймер!', 'green');
    }
  }, 650);
}

// ================= 7. pipe-catalog =================
interface CatalogProduct {
  name: string;
  inStock: boolean;
  price: number;
  finalPrice?: number;
  status?: 'pending' | 'filtered' | 'passed';
}

const pcItems = ref<CatalogProduct[]>([
  { name: '🎧 Наушники', inStock: true, price: 5000, status: 'pending' },
  { name: '📷 Камера (нет на складе)', inStock: false, price: 12000, status: 'pending' },
  { name: '⌚ Смарт-часы', inStock: true, price: 8000, status: 'pending' },
]);

function runPipeCatalog() {
  clearTimers();
  pcItems.value.forEach((i) => {
    i.status = 'pending';
    i.finalPrice = undefined;
  });

  pcItems.value.forEach((item, idx) => {
    const t = setTimeout(() => {
      if (!item.inStock) {
        item.status = 'filtered';
        addLog('filter()', `${item.name} — нет в наличии, отброшен`, 'orange');
      } else {
        item.status = 'passed';
        item.finalPrice = item.price * 0.9;
        addLog('map(-10%)', `${item.name} → со скидкой ${item.finalPrice} ₽`, 'green');
      }
    }, idx * 420);
    activeTimers.push(t);
  });
}

// ================= 8. start-with-profile =================
const swMode = ref<'without' | 'with'>('with');
const swStatus = ref<'empty' | 'skeleton' | 'ready'>('skeleton');

function runStartWith(mode: 'without' | 'with') {
  clearTimers();
  swMode.value = mode;
  if (mode === 'with') {
    swStatus.value = 'skeleton';
    addLog("startWith('loading')", 'Мгновенно показали скелетон, пока ждём сервер', 'teal');
  } else {
    swStatus.value = 'empty';
    addLog('без startWith', 'Экран пустой 700 мс — пользователь видит дыру', 'orange');
  }

  const t = setTimeout(() => {
    swStatus.value = 'ready';
    addLog('next(profile)', 'Ответ сервера пришёл — рисуем карточку', 'green');
  }, 700);
  activeTimers.push(t);
}

// ================= 9. distinct-tabs =================
const dtActive = ref('books');
const dtRequests = ref(1);

function clickCategoryTab(cat: string) {
  if (cat === dtActive.value) {
    addLog('distinctUntilChanged', `Категория «${cat}» уже выбрана — лишний запрос отсечён!`, 'orange');
  } else {
    dtActive.value = cat;
    dtRequests.value++;
    addLog('next(category)', `Сменили на «${cat}» → запрос #${dtRequests.value} отправлен`, 'green');
  }
}

// ================= 10. debounce-search =================
const dbTyped = ref('');
const dbSentCount = ref(0);
const dbWaiting = ref(false);

function typeDebounceChar(word: string) {
  clearTimers();
  dbTyped.value = word;
  dbWaiting.value = true;
  addLog('нажатие клавиши', `Текст: «${word}» — таймер 300 мс перезапущен`, 'blue');

  const t = setTimeout(() => {
    dbWaiting.value = false;
    dbSentCount.value++;
    addLog('debounceTime(300)', `Пауза! Ушёл всего 1 запрос для «${word}»`, 'green');
  }, 550);
  activeTimers.push(t);
}

// ================= 11-14. Higher Order Mini Apps =================
const hoCurrentItem = ref<string>('Товар #1 (📱 Смартфон)');
const hoLoading = ref(false);

function triggerHoSwitch(id: number, title: string) {
  clearTimers();
  if (hoLoading.value) {
    addLog('switchMap', 'Старый запрос отменён (✕), переключаемся на новый!', 'orange');
  }
  hoLoading.value = true;
  addLog('click$', `Запрос товара #${id}...`, 'blue');
  const t = setTimeout(() => {
    hoLoading.value = false;
    hoCurrentItem.value = title;
    addLog('next()', `Показан актуальный: ${title}`, 'green');
  }, 500);
  activeTimers.push(t);
}

const hoMergeLoaded = ref<string[]>([]);
function triggerHoMerge() {
  clearTimers();
  hoMergeLoaded.value = [];
  addLog('mergeMap', 'Запустили загрузку 3 акций параллельно...', 'blue');
  const stocks = [
    { name: '💎 ETH (+4.2%)', delay: 280 },
    { name: '🥇 GOLD (+0.8%)', delay: 520 },
    { name: '🪙 BTC (+2.1%)', delay: 800 },
  ];
  stocks.forEach((s) => {
    const t = setTimeout(() => {
      hoMergeLoaded.value.push(s.name);
      addLog('next()', `Готово: ${s.name}`, 'green');
    }, s.delay);
    activeTimers.push(t);
  });
}

const hoConcatQueue = ref<{ name: string; state: 'wait' | 'saving' | 'done' }[]>([
  { name: 'Шаг 1: Имя профиля', state: 'done' },
  { name: 'Шаг 2: Аватар', state: 'done' },
  { name: 'Шаг 3: Уведомления', state: 'done' },
]);

function triggerHoConcat() {
  clearTimers();
  hoConcatQueue.value = [
    { name: 'Шаг 1: Имя профиля', state: 'saving' },
    { name: 'Шаг 2: Аватар', state: 'wait' },
    { name: 'Шаг 3: Уведомления', state: 'wait' },
  ];
  addLog('concatMap', 'Сохраняем строго по очереди: сначала Шаг 1', 'teal');

  const t1 = setTimeout(() => {
    hoConcatQueue.value[0].state = 'done';
    hoConcatQueue.value[1].state = 'saving';
    addLog('concatMap', 'Шаг 1 сохранён → теперь запускаем Шаг 2', 'blue');
  }, 450);

  const t2 = setTimeout(() => {
    hoConcatQueue.value[1].state = 'done';
    hoConcatQueue.value[2].state = 'saving';
    addLog('concatMap', 'Шаг 2 сохранён → запускаем Шаг 3', 'blue');
  }, 900);

  const t3 = setTimeout(() => {
    hoConcatQueue.value[2].state = 'done';
    addLog('complete()', 'Все 3 шага сохранены в строгом порядке!', 'green');
  }, 1350);

  activeTimers.push(t1, t2, t3);
}

const hoExhaustBusy = ref(false);
const hoExhaustClicks = ref(0);
const hoExhaustOrders = ref(0);

function triggerHoExhaust() {
  hoExhaustClicks.value++;
  if (hoExhaustBusy.value) {
    addLog('exhaustMap', 'Клик проигнорирован! Заказ уже оформляется', 'orange');
    return;
  }
  hoExhaustBusy.value = true;
  addLog('exhaustMap', 'Оформляем заказ (800 мс)... Попробуйте кликнуть ещё раз!', 'teal');
  const t = setTimeout(() => {
    hoExhaustBusy.value = false;
    hoExhaustOrders.value++;
    addLog('next()', `Заказ #${hoExhaustOrders.value} успешно оплачен (без дублей!)`, 'green');
  }, 850);
  activeTimers.push(t);
}

// ================= 15. upload-limit =================
const ulFiles = ref([
  { name: 'photo-1.jpg', status: 'done' },
  { name: 'photo-2.jpg', status: 'done' },
  { name: 'video-3.mp4', status: 'done' },
  { name: 'doc-4.pdf', status: 'done' },
]);

function runUploadLimit() {
  clearTimers();
  ulFiles.value = [
    { name: 'photo-1.jpg', status: 'uploading' },
    { name: 'photo-2.jpg', status: 'uploading' },
    { name: 'video-3.mp4', status: 'queued' },
    { name: 'doc-4.pdf', status: 'queued' },
  ];
  addLog('mergeMap(fn, 2)', 'Стартовали первые 2 файла, остальные ждут слот', 'teal');

  const t1 = setTimeout(() => {
    ulFiles.value[0].status = 'done';
    ulFiles.value[2].status = 'uploading';
    addLog('слот освободился', 'photo-1 готов → стартовал video-3.mp4', 'blue');
  }, 450);

  const t2 = setTimeout(() => {
    ulFiles.value[1].status = 'done';
    ulFiles.value[3].status = 'uploading';
    addLog('слот освободился', 'photo-2 готов → стартовал doc-4.pdf', 'blue');
  }, 750);

  const t3 = setTimeout(() => {
    ulFiles.value[2].status = 'done';
    ulFiles.value[3].status = 'done';
    addLog('complete()', 'Все 4 файла загружены (не более 2 одновременно)', 'green');
  }, 1150);

  activeTimers.push(t1, t2, t3);
}

// ================= 16. combine-filters =================
const cfCat = ref<'Книги' | 'Гаджеты'>('Книги');
const cfSort = ref<'Дешевле' | 'Популярные'>('Популярные');

function updateCombineFilter(cat?: 'Книги' | 'Гаджеты', sort?: 'Дешевле' | 'Популярные') {
  if (cat) cfCat.value = cat;
  if (sort) cfSort.value = sort;
  addLog('combineLatest', `Запрос каталога: [${cfCat.value}, ${cfSort.value}]`, 'green');
}

// ================= 17. with-latest-save =================
const wlRole = ref<'user' | 'admin'>('user');
const wlSaved = ref<string>('Ещё не сохраняли');

function changeWlRole(r: 'user' | 'admin') {
  wlRole.value = r;
  addLog('role$', `Роль в фоне сменилась на «${r}» (сохранение НЕ вызывается)`, 'blue');
}

function clickWlSave() {
  wlSaved.value = `Сохранено с правами: ${wlRole.value.toUpperCase()}`;
  addLog('withLatestFrom', `Клик! Взяли текущую роль «${wlRole.value}» и отправили запрос`, 'green');
}

// ================= 18. forkjoin-assets =================
const fjMode = ref<'forkJoin' | 'mergeMap'>('forkJoin');
const fjAssets = ref<{ name: string; price: string }[]>([]);
const fjLoading = ref(false);

function runAssetsDemo(mode: 'forkJoin' | 'mergeMap') {
  clearTimers();
  fjMode.value = mode;
  fjAssets.value = [];
  fjLoading.value = true;

  const list = [
    { name: '🪙 BTC', price: '84 200 $', delay: 300 },
    { name: '💎 ETH', price: '2 950 $', delay: 550 },
    { name: '📈 S&P 500', price: '5 890 $', delay: 800 },
  ];

  if (mode === 'forkJoin') {
    addLog('forkJoin', 'Ждём, пока загрузятся ВСЕ 3 актива...', 'teal');
    const t = setTimeout(() => {
      fjAssets.value = list;
      fjLoading.value = false;
      addLog('complete()', 'Все 3 ответа готовы — отрисовали дашборд разом!', 'green');
    }, 800);
    activeTimers.push(t);
  } else {
    addLog('mergeMap', 'Рисуем каждый актив сразу по мере ответа сервера', 'blue');
    list.forEach((item, idx) => {
      const t = setTimeout(() => {
        fjAssets.value.push(item);
        if (idx === list.length - 1) fjLoading.value = false;
        addLog('next()', `${item.name} появился на экране`, 'green');
      }, item.delay);
      activeTimers.push(t);
    });
  }
}

// ================= 19. scan-cart =================
const scItems = ref<{ name: string; price: number }[]>([
  { name: '📖 Книга RxJS', price: 1200 },
]);

const scTotal = ref(1200);

function updateScanCart(action: 'addBook' | 'addHeadphones' | 'clear') {
  if (action === 'addBook') {
    scItems.value.push({ name: '📖 Книга RxJS', price: 1200 });
    scTotal.value += 1200;
    addLog('scan()', `+1200 ₽ → Новая сумма корзины: ${scTotal.value} ₽`, 'green');
  } else if (action === 'addHeadphones') {
    scItems.value.push({ name: '🎧 Наушники', price: 3500 });
    scTotal.value += 3500;
    addLog('scan()', `+3500 ₽ → Новая сумма корзины: ${scTotal.value} ₽`, 'green');
  } else {
    scItems.value = [];
    scTotal.value = 0;
    addLog('scan()', 'Корзина очищена → состояние сброшено в 0 ₽', 'orange');
  }
}

// Инициализация стартового лога
watch(
  () => props.scenario,
  (sc) => {
    clearTimers();
    logs.value = [];
    if (sc === 'events-timeline') {
      addLog('готово', 'Нажимайте кнопки в мини-приложении, чтобы увидеть события во времени', 'teal');
    } else if (sc === 'book-search') {
      runBookSearch('rx');
    } else if (sc === 'signals-profile') {
      runProfileSignal('ok');
    } else if (sc === 'of-vs-from') {
      runOfVsFrom('from');
    } else if (sc === 'pipe-catalog') {
      runPipeCatalog();
    } else if (sc === 'forkjoin-assets') {
      runAssetsDemo('forkJoin');
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="rx-mini-app comet-card">
    <!-- Шапка мини-приложения -->
    <div class="mini-header">
      <div class="window-dots">
        <span class="dot red" />
        <span class="dot yellow" />
        <span class="dot green" />
      </div>
      <span class="mini-badge">ИНТЕРАКТИВНОЕ МИНИ-ПРИЛОЖЕНИЕ</span>
    </div>

    <!-- 1. events-timeline -->
    <div v-if="scenario === 'events-timeline'" class="mini-body">
      <div class="app-row">
        <div class="social-card">
          <div class="social-title">Пост в ленте</div>
          <p class="social-text">Реактивный подход делает код предсказуемым</p>
          <button type="button" class="mini-btn teal" @click="etClickLike">
            ❤️ Лайк ({{ etLikes }})
          </button>
        </div>

        <div class="social-card">
          <div class="social-title">Быстрый поиск товаров</div>
          <div class="btn-group">
            <button type="button" class="mini-btn" @click="etTypeSearch(' телефон')">
              Набрать «телефон»
            </button>
            <button type="button" class="mini-btn" @click="etTypeSearch('ноутбук')">
              Набрать «ноутбук»
            </button>
          </div>
          <div class="status-pill" :class="etServerStatus">
            <template v-if="etServerStatus === 'idle'">Ждём ввода пользователя...</template>
            <template v-else-if="etServerStatus === 'loading'">⏳ Запрос на сервер...</template>
            <template v-else>✅ Найдены товары: «{{ etQuery }}»</template>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. book-search -->
    <div v-else-if="scenario === 'book-search'" class="mini-body">
      <div class="search-bar-demo">
        <span class="search-label">Строка поиска: <strong>{{ bsInput || '...' }}</strong></span>
        <div class="btn-group">
          <button type="button" class="mini-btn teal" @click="runBookSearch('rx')">
            Набрать «rx»
          </button>
          <button type="button" class="mini-btn" @click="runBookSearch('ng')">
            Набрать «ng»
          </button>
          <button type="button" class="mini-btn" @click="runBookSearch('ts')">
            Набрать «ts»
          </button>
        </div>
      </div>

      <div class="steps-flow">
        <div class="step-box" :class="{ active: bsStep >= 1 }">1. Ввод текста</div>
        <div class="step-box" :class="{ active: bsStep >= 2 }">2. Пауза 300 мс</div>
        <div class="step-box" :class="{ active: bsStep >= 3 }">3. Запрос к API</div>
        <div class="step-box done" :class="{ active: bsStep >= 4 }">4. Книги на экране</div>
      </div>

      <div class="books-mini-grid">
        <div v-for="b in bsBooks" :key="b.title" class="book-mini-card">
          <span class="book-tag">{{ b.tag }}</span>
          <strong>{{ b.title }}</strong>
          <span class="book-price">{{ b.price }}</span>
        </div>
      </div>
    </div>

    <!-- 3. signals-profile -->
    <div v-else-if="scenario === 'signals-profile'" class="mini-body">
      <div class="btn-group mb-2">
        <button type="button" class="mini-btn teal" @click="runProfileSignal('ok')">
          ▶ Загрузить профиль (успех)
        </button>
        <button type="button" class="mini-btn red" @click="runProfileSignal('error')">
          ▶ Сымитировать сбой 500
        </button>
      </div>

      <div v-if="spState === 'loading'" class="profile-mini">
        <div class="avatar-circle">⏳</div>
        <div>
          <strong>Загружаем данные...</strong>
          <div class="text-xs opacity-70">Поток открыт, ждём next() или error()</div>
        </div>
      </div>
      <div v-else-if="spState === 'ok'" class="profile-mini ok">
        <div class="avatar-circle">А</div>
        <div>
          <strong>Алексей (@alex_dev) · 1 420 подписчиков</strong>
          <div class="text-xs text-[#437a22] font-semibold">
            Пришёл next(profile), а затем complete() |
          </div>
        </div>
      </div>
      <div v-else-if="spState === 'error'" class="profile-mini err">
        <div class="avatar-circle">✕</div>
        <div>
          <strong>Ошибка 500: не удалось загрузить профиль</strong>
          <div class="text-xs text-[#a13544] font-semibold">
            Сработал сигнал error() — поток закрыт
          </div>
        </div>
      </div>
    </div>

    <!-- 4. player-leak -->
    <div v-else-if="scenario === 'player-leak'" class="mini-body">
      <div class="btn-group mb-2">
        <button type="button" class="mini-btn red" @click="startPlayer(false)">
          ▶ Открыть плеер БЕЗ отписки
        </button>
        <button type="button" class="mini-btn teal" @click="startPlayer(true)">
          ▶ Открыть с takeUntilDestroyed
        </button>
        <button v-if="plOpen" type="button" class="mini-btn" @click="closePlayer">
          ✕ Закрыть плеер (уйти со страницы)
        </button>
      </div>

      <div v-if="plOpen" class="player-box">
        <span>🎵 Трек: Reactive Vibes — играет {{ plSec }} сек.</span>
        <span class="badge-live">В ЭФИРЕ</span>
      </div>
      <div v-else-if="plZombieSec > 0" class="player-box leak">
        <span>🧟 Плеер удалён с экрана, но таймер тикает в памяти: +{{ plZombieSec }} тиков!</span>
      </div>
      <div v-else class="player-box clean">
        <span>✅ Плеер закрыт. Лишних фоновых процессов нет.</span>
      </div>
    </div>

    <!-- 5. of-vs-from -->
    <div v-else-if="scenario === 'of-vs-from'" class="mini-body">
      <div class="btn-group mb-2">
        <button type="button" class="mini-btn" @click="runOfVsFrom('of')">
          Запустить of([📱, 🎧, ⌚])
        </button>
        <button type="button" class="mini-btn teal" @click="runOfVsFrom('from')">
          Запустить from([📱, 🎧, ⌚])
        </button>
      </div>

      <div class="chips-area">
        <div
          v-for="(item, idx) in ofResult"
          :key="idx"
          class="chip-item"
          :class="{ orange: ofMode === 'of' }"
        >
          Вызов next #{{ idx + 1 }}: <strong>{{ item }}</strong>
        </div>
      </div>
    </div>

    <!-- 6. promo-timer -->
    <div v-else-if="scenario === 'promo-timer'" class="mini-body">
      <div class="promo-box">
        <div>
          <div class="text-xs font-mono uppercase text-[#01696f] font-bold">Промо-баннер</div>
          <strong v-if="ptStatus !== 'done'">Скидка 20% активируется через: {{ ptStep }} сек.</strong>
          <strong v-else class="text-[#437a22]">🎉 Промокод RXJS20 применён! Поток сам закрылся.</strong>
        </div>
        <button type="button" class="mini-btn teal" @click="startPromoCountdown">
          ▶ Запустить отсчёт
        </button>
      </div>
    </div>

    <!-- 7. pipe-catalog -->
    <div v-else-if="scenario === 'pipe-catalog'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold">Фильтруем склад и применяем скидку 10%:</span>
        <button type="button" class="mini-btn teal" @click="runPipeCatalog">
          ▶ Прогнать через pipe()
        </button>
      </div>
      <div class="catalog-list">
        <div
          v-for="item in pcItems"
          :key="item.name"
          class="catalog-row"
          :class="item.status"
        >
          <span>{{ item.name }}</span>
          <span v-if="item.status === 'filtered'" class="text-xs text-[#a13544] font-bold">
            ✕ Отсеян в filter()
          </span>
          <span v-else-if="item.status === 'passed'" class="text-xs text-[#437a22] font-bold">
            ✓ map(): {{ item.finalPrice }} ₽ (было {{ item.price }} ₽)
          </span>
          <span v-else class="text-xs opacity-60">{{ item.price }} ₽</span>
        </div>
      </div>
    </div>

    <!-- 8. start-with-profile -->
    <div v-else-if="scenario === 'start-with-profile'" class="mini-body">
      <div class="btn-group mb-2">
        <button type="button" class="mini-btn teal" @click="runStartWith('with')">
          С оператором startWith('loading')
        </button>
        <button type="button" class="mini-btn" @click="runStartWith('without')">
          Без startWith
        </button>
      </div>

      <div v-if="swStatus === 'empty'" class="profile-mini warn">
        <span>Пустой экран... Пользователь не понимает, нажалась ли кнопка</span>
      </div>
      <div v-else-if="swStatus === 'skeleton'" class="profile-mini">
        <div class="avatar-circle">⏳</div>
        <div>
          <strong>Загружаем карточку автора... (Скелетон из startWith)</strong>
          <div class="text-xs opacity-70">Мгновенная реакция интерфейса</div>
        </div>
      </div>
      <div v-else class="profile-mini ok">
        <div class="avatar-circle">М</div>
        <div>
          <strong>Мария · Frontend Lead</strong>
          <div class="text-xs text-[#437a22]">Данные с сервера загружены</div>
        </div>
      </div>
    </div>

    <!-- 9. distinct-tabs -->
    <div v-else-if="scenario === 'distinct-tabs'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <div class="btn-group">
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: dtActive === 'books' }"
            @click="clickCategoryTab('books')"
          >
            📚 Книги
          </button>
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: dtActive === 'games' }"
            @click="clickCategoryTab('games')"
          >
            🎮 Игры
          </button>
        </div>
        <span class="text-xs font-mono font-bold text-[#01696f]">
          Отправлено запросов: {{ dtRequests }}
        </span>
      </div>
      <div class="text-xs text-[#57554e]">
        Нажмите несколько раз подряд на уже активную вкладку: <code>distinctUntilChanged()</code> не пустит повторный запрос.
      </div>
    </div>

    <!-- 10. debounce-search -->
    <div v-else-if="scenario === 'debounce-search'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <div class="btn-group">
          <button type="button" class="mini-btn" @click="typeDebounceChar('r')">«r»</button>
          <button type="button" class="mini-btn" @click="typeDebounceChar('rx')">«rx»</button>
          <button type="button" class="mini-btn teal" @click="typeDebounceChar('rxjs')">«rxjs»</button>
        </div>
        <span class="text-xs font-mono font-bold text-[#437a22]">
          Запросов ушло в сеть: {{ dbSentCount }}
        </span>
      </div>
      <div class="status-pill" :class="dbWaiting ? 'loading' : 'done'">
        <template v-if="dbWaiting">⏳ Печатаем «{{ dbTyped }}» — ждём 300 мс тишины...</template>
        <template v-else>✅ Пауза выдержана! Отправлен запрос для «{{ dbTyped || 'rxjs' }}»</template>
      </div>
    </div>

    <!-- 11. ho-switch -->
    <div v-else-if="scenario === 'ho-switch'" class="mini-body">
      <div class="btn-group mb-2">
        <button type="button" class="mini-btn" @click="triggerHoSwitch(1, 'Товар #1 (📱 Смартфон)')">
          Товар 1
        </button>
        <button type="button" class="mini-btn" @click="triggerHoSwitch(2, 'Товар #2 (💻 Ноутбук)')">
          Товар 2
        </button>
        <button type="button" class="mini-btn teal" @click="triggerHoSwitch(3, 'Товар #3 (🎧 Наушники)')">
          Товар 3
        </button>
      </div>
      <div class="status-pill" :class="hoLoading ? 'loading' : 'done'">
        {{ hoLoading ? '⏳ Загружаем новый товар (старый запрос отменён)...' : `На экране: ${hoCurrentItem}` }}
      </div>
    </div>

    <!-- 12. ho-merge -->
    <div v-else-if="scenario === 'ho-merge'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold">Котировки акций (кто быстрее ответил, тот и на экране):</span>
        <button type="button" class="mini-btn teal" @click="triggerHoMerge">
          ▶ Загрузить параллельно
        </button>
      </div>
      <div class="chips-area">
        <span v-if="hoMergeLoaded.length === 0" class="text-xs opacity-60">Нажмите кнопку для запуска...</span>
        <span v-for="s in hoMergeLoaded" :key="s" class="chip-item">{{ s }}</span>
      </div>
    </div>

    <!-- 13. ho-concat -->
    <div v-else-if="scenario === 'ho-concat'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold">Пошаговое сохранение анкеты:</span>
        <button type="button" class="mini-btn teal" @click="triggerHoConcat">
          ▶ Сохранить по очереди
        </button>
      </div>
      <div class="catalog-list">
        <div v-for="step in hoConcatQueue" :key="step.name" class="catalog-row">
          <span>{{ step.name }}</span>
          <span v-if="step.state === 'wait'" class="text-xs opacity-60">В очереди...</span>
          <span v-else-if="step.state === 'saving'" class="text-xs text-[#da7101] font-bold">⏳ Сохраняем...</span>
          <span v-else class="text-xs text-[#437a22] font-bold">✓ Готово</span>
        </div>
      </div>
    </div>

    <!-- 14. ho-exhaust -->
    <div v-else-if="scenario === 'ho-exhaust'" class="mini-body">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold">Корзина: Итого 9 380 ₽</div>
          <div class="text-xs text-[#6e6c65]">
            Кликов по кнопке: <strong>{{ hoExhaustClicks }}</strong> · Списаний оплаты: <strong class="text-[#437a22]">{{ hoExhaustOrders }}</strong>
          </div>
        </div>
        <button type="button" class="mini-btn teal" @click="triggerHoExhaust">
          {{ hoExhaustBusy ? '⏳ Оформляем... (кликните ещё!)' : '💳 Оплатить заказ' }}
        </button>
      </div>
    </div>

    <!-- 15. upload-limit -->
    <div v-else-if="scenario === 'upload-limit'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold">Загрузка 4 файлов по 2 слота (mergeMap, 2):</span>
        <button type="button" class="mini-btn teal" @click="runUploadLimit">
          ▶ Загрузить файлы
        </button>
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <div v-for="f in ulFiles" :key="f.name" class="catalog-row">
          <span>{{ f.name }}</span>
          <span v-if="f.status === 'uploading'" class="text-xs text-[#006494] font-bold">⏳ Качается</span>
          <span v-else-if="f.status === 'queued'" class="text-xs opacity-60">Ждёт слот</span>
          <span v-else class="text-xs text-[#437a22] font-bold">✓ Готов</span>
        </div>
      </div>
    </div>

    <!-- 16. combine-filters -->
    <div v-else-if="scenario === 'combine-filters'" class="mini-body">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="btn-group">
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: cfCat === 'Книги' }"
            @click="updateCombineFilter('Книги', undefined)"
          >
            Категория: Книги
          </button>
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: cfCat === 'Гаджеты' }"
            @click="updateCombineFilter('Гаджеты', undefined)"
          >
            Категория: Гаджеты
          </button>
        </div>
        <div class="btn-group">
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: cfSort === 'Популярные' }"
            @click="updateCombineFilter(undefined, 'Популярные')"
          >
            Сначала популярные
          </button>
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: cfSort === 'Дешевле' }"
            @click="updateCombineFilter(undefined, 'Дешевле')"
          >
            Сначала дешевле
          </button>
        </div>
      </div>
      <div class="status-pill done">
        Экран каталога: <strong>{{ cfCat }}</strong> · Сортировка: <strong>{{ cfSort }}</strong>
      </div>
    </div>

    <!-- 17. with-latest-save -->
    <div v-else-if="scenario === 'with-latest-save'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <div class="btn-group">
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: wlRole === 'user' }"
            @click="changeWlRole('user')"
          >
            Роль: User
          </button>
          <button
            type="button"
            class="mini-btn"
            :class="{ teal: wlRole === 'admin' }"
            @click="changeWlRole('admin')"
          >
            Роль: Admin
          </button>
        </div>
        <button type="button" class="mini-btn teal" @click="clickWlSave">
          💾 Сохранить документ
        </button>
      </div>
      <div class="status-pill done">{{ wlSaved }}</div>
    </div>

    <!-- 18. forkjoin-assets -->
    <div v-else-if="scenario === 'forkjoin-assets'" class="mini-body">
      <div class="btn-group mb-2">
        <button type="button" class="mini-btn teal" @click="runAssetsDemo('forkJoin')">
          forkJoin (показать все разом)
        </button>
        <button type="button" class="mini-btn" @click="runAssetsDemo('mergeMap')">
          mergeMap (по одному по мере ответа)
        </button>
      </div>
      <div class="books-mini-grid">
        <div v-if="fjLoading && fjAssets.length === 0" class="text-xs opacity-70 py-2">
          ⏳ Ждём ответа всех сервисов...
        </div>
        <div v-for="a in fjAssets" :key="a.name" class="book-mini-card">
          <strong>{{ a.name }}</strong>
          <span class="book-price">{{ a.price }}</span>
        </div>
      </div>
    </div>

    <!-- 19. scan-cart -->
    <div v-else-if="scenario === 'scan-cart'" class="mini-body">
      <div class="flex items-center justify-between mb-2">
        <div class="btn-group">
          <button type="button" class="mini-btn teal" @click="updateScanCart('addBook')">
            + 📖 Книга (1 200 ₽)
          </button>
          <button type="button" class="mini-btn teal" @click="updateScanCart('addHeadphones')">
            + 🎧 Наушники (3 500 ₽)
          </button>
          <button type="button" class="mini-btn red" @click="updateScanCart('clear')">
            Очистить
          </button>
        </div>
        <div class="text-sm font-bold text-[#01696f]">
          Итого: {{ scTotal }} ₽ ({{ scItems.length }} шт.)
        </div>
      </div>
    </div>

    <!-- Лог событий потока -->
    <div class="mini-logs">
      <div v-for="l in logs" :key="l.id" class="log-line">
        <span class="log-badge" :class="l.tone">{{ l.tag }}</span>
        <span class="log-text">{{ l.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rx-mini-app {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d5d3ca;
}

.mini-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e4dc;
  padding-bottom: 6px;
}

.window-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot.red { background: #e06c75; }
.dot.yellow { background: #e5c07b; }
.dot.green { background: #98c379; }

.mini-badge {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  color: #01696f;
  letter-spacing: 0.06em;
}

.mini-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.app-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 10px;
}

.social-card {
  background: #f7f6f2;
  border: 1px solid #dcdad2;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.social-title {
  font-weight: 700;
  font-size: 12px;
  color: #171614;
}

.social-text {
  font-size: 11.5px;
  color: #57554e;
  margin: 0;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 7px;
  border: 1px solid #d2cfc6;
  background: #ffffff;
  color: #171614;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-btn:hover {
  border-color: #01696f;
  color: #01696f;
}

.mini-btn.teal {
  background: #01696f;
  color: #ffffff;
  border-color: #01696f;
}

.mini-btn.red {
  background: #f5e1e4;
  color: #a13544;
  border-color: rgba(161, 53, 68, 0.35);
}

.status-pill {
  font-size: 11.5px;
  padding: 5px 10px;
  border-radius: 7px;
  background: #eceae3;
  color: #3a372f;
  font-weight: 600;
}

.status-pill.loading {
  background: #f7ebd9;
  color: #964b00;
}

.status-pill.done {
  background: #e2ede6;
  color: #2f5e16;
}

.search-bar-demo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.search-label {
  font-size: 12px;
}

.steps-flow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.step-box {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 5px 6px;
  border-radius: 6px;
  background: #f2f1ec;
  border: 1px solid #dcdad2;
  color: #6e6c65;
  transition: all 0.2s ease;
}

.step-box.active {
  background: #e3ece8;
  border-color: #01696f;
  color: #01696f;
}

.step-box.done.active {
  background: #d6eadf;
  border-color: #437a22;
  color: #2f5e16;
}

.books-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.book-mini-card {
  background: #f7f6f2;
  border: 1px solid #dcdad2;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.book-tag {
  font-family: var(--font-mono);
  font-size: 9.5px;
  text-transform: uppercase;
  color: #01696f;
  font-weight: 700;
}

.book-price {
  font-weight: 700;
  color: #437a22;
  font-size: 11.5px;
}

.profile-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f7f6f2;
  border: 1px solid #dcdad2;
  font-size: 12px;
}

.profile-mini.ok {
  background: #e2ede6;
  border-color: rgba(67, 122, 34, 0.35);
}

.profile-mini.err {
  background: #f5e1e4;
  border-color: rgba(161, 53, 68, 0.35);
}

.profile-mini.warn {
  background: #f7ebd9;
  border-color: rgba(218, 113, 1, 0.35);
  color: #7c4000;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #01696f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.player-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 11px;
  border-radius: 8px;
  background: #e3ece8;
  border: 1px solid #01696f;
  font-size: 12px;
  font-weight: 600;
}

.player-box.leak {
  background: #f5e1e4;
  border-color: #a13544;
  color: #a13544;
}

.player-box.clean {
  background: #e2ede6;
  border-color: #437a22;
  color: #2f5e16;
}

.badge-live {
  font-family: var(--font-mono);
  font-size: 10px;
  background: #01696f;
  color: #fff;
  padding: 2px 7px;
  border-radius: 999px;
}

.chips-area {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-item {
  font-size: 11.5px;
  background: #e3ece8;
  border: 1px solid rgba(1, 105, 111, 0.3);
  color: #171614;
  padding: 4px 10px;
  border-radius: 999px;
}

.chip-item.orange {
  background: #f7ebd9;
  border-color: rgba(218, 113, 1, 0.35);
}

.promo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f7f6f2;
  border: 1px solid #dcdad2;
  font-size: 12.5px;
}

.catalog-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.catalog-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: 6px;
  background: #f7f6f2;
  border: 1px solid #e2e0d8;
  font-size: 11.5px;
}

.catalog-row.filtered {
  opacity: 0.6;
  background: #f5e1e4;
}

.catalog-row.passed {
  background: #e2ede6;
}

.mini-logs {
  border-top: 1px dashed #d5d3ca;
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.log-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  line-height: 1.3;
}

.log-badge {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  color: #fff;
  background: #01696f;
  flex-shrink: 0;
}

.log-badge.green { background: #437a22; }
.log-badge.orange { background: #da7101; }
.log-badge.red { background: #a13544; }
.log-badge.blue { background: #006494; }
.log-badge.gray { background: #6e6c65; }

.log-text {
  color: #3a372f;
}
</style>
