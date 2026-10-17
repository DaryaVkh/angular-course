<script setup lang="ts">
import { ref, computed } from 'vue';
import MarbleStream, { MarbleTrack, MarbleStep } from './MarbleStream.vue';

const activeOp = ref<'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap'>('switchMap');

interface StrategyInfo {
  id: 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap';
  title: string;
  tagline: string;
  priority: string;
  color: string;
  bestFor: string[];
  danger: string;
  code: string;
  tracks: MarbleTrack[];
  steps: MarbleStep[];
}

const STRATEGIES: Record<string, StrategyInfo> = {
  switchMap: {
    id: 'switchMap',
    title: 'switchMap — отменяет прошлый запрос',
    tagline: 'Как только пришло новое значение, старый запрос отменяется',
    priority: 'Только актуальное',
    color: '#01696f',
    bestFor: ['Поиск по мере ввода', 'Переключение вкладок и параметров URL', 'Фильтрация списка'],
    danger: 'Не подходит для сохранения и удаления: новое событие отменит запрос на полпути.',
    code: `searchControl.valueChanges.pipe(\n  debounceTime(300),\n  switchMap(text => http.get('/api/search?q=' + text))\n)`,
    tracks: [
      {
        name: 'ввод',
        items: [
          { x: 14, label: 'r', color: 'teal' },
          { x: 40, label: 'rx', color: 'teal' },
          { x: 66, label: 'rxjs', color: 'teal' },
        ],
      },
      {
        name: "запрос 'r'",
        items: [
          { x: 14, label: 'старт', color: 'gray' },
          { x: 40, label: 'отмена', kind: 'cancel' },
        ],
      },
      {
        name: "запрос 'rx'",
        items: [
          { x: 40, label: 'старт', color: 'gray' },
          { x: 66, label: 'отмена', kind: 'cancel' },
        ],
      },
      {
        name: 'результат',
        completeAt: 92,
        items: [
          { x: 66, label: 'старт', color: 'gray' },
          { x: 84, label: 'ответ rxjs', color: 'green' },
        ],
      },
    ],
    steps: [
      { x: 14, text: "Пользователь ввёл 'r' — ушёл первый запрос на сервер." },
      { x: 40, text: "Ввели 'rx' до ответа — запрос 'r' тут же отменяется (✕), стартует запрос 'rx'." },
      { x: 66, text: "Ввели 'rxjs' — запрос 'rx' тоже отменяется (✕), стартует запрос 'rxjs'." },
      { x: 84, text: "Запрос 'rxjs' спокойно завершился — на экран попал только актуальный ответ." },
    ],
  },
  mergeMap: {
    id: 'mergeMap',
    title: 'mergeMap — запускает всё параллельно',
    tagline: 'Ничего не ждёт и ничего не отменяет: кто быстрее ответил, тот и пришёл',
    priority: 'Скорость',
    color: '#006494',
    bestFor: ['Загрузка независимых карточек по списку ID', 'Отправка аналитики и логов'],
    danger: 'В поиске приводит к гонке запросов: медленный старый ответ может прийти позже нового и перезаписать экран.',
    code: `from([1, 2]).pipe(\n  mergeMap(id => http.get(\`/api/items/\${id}\`))\n)`,
    tracks: [
      {
        name: 'события',
        items: [
          { x: 14, label: 'id: 1', color: 'teal' },
          { x: 30, label: 'id: 2', color: 'teal' },
        ],
      },
      {
        name: 'запрос 1',
        completeAt: 82,
        items: [
          { x: 14, label: 'старт', color: 'gray' },
          { x: 76, label: 'ответ 1', color: 'blue' },
        ],
      },
      {
        name: 'запрос 2',
        completeAt: 58,
        items: [
          { x: 30, label: 'старт', color: 'gray' },
          { x: 52, label: 'ответ 2', color: 'orange' },
        ],
      },
      {
        name: 'результат',
        completeAt: 88,
        items: [
          { x: 52, label: 'ответ 2', color: 'orange' },
          { x: 76, label: 'ответ 1', color: 'blue' },
        ],
      },
    ],
    steps: [
      { x: 14, text: 'Пришёл id: 1 — запустился первый запрос (он окажется медленным).' },
      { x: 30, text: 'Пришёл id: 2 — параллельно запустился второй запрос, первый продолжает идти.' },
      { x: 52, text: 'Второй запрос оказался быстрее — его ответ пришёл первым.' },
      { x: 76, text: 'Медленный первый запрос дошёл позже — оба ответа получены, но порядок поменялся.' },
    ],
  },
  concatMap: {
    id: 'concatMap',
    title: 'concatMap — выстраивает строгую очередь',
    tagline: 'Следующий запрос не начнётся, пока полностью не завершится предыдущий',
    priority: 'Строгий порядок',
    color: '#da7101',
    bestFor: ['Пошаговое сохранение изменений', 'Загрузка файлов по очереди', 'Операции, где важен порядок'],
    danger: 'Если запросы медленные, а событий много, очередь растянется и интерфейс будет ждать.',
    code: `saveSteps$.pipe(\n  concatMap(step => http.post('/api/save', step))\n)`,
    tracks: [
      {
        name: 'события',
        items: [
          { x: 14, label: 'шаг 1', color: 'teal' },
          { x: 26, label: 'шаг 2', color: 'teal' },
        ],
      },
      {
        name: 'запрос 1',
        completeAt: 48,
        items: [
          { x: 14, label: 'старт', color: 'gray' },
          { x: 44, label: 'ок 1', color: 'blue' },
        ],
      },
      {
        name: 'запрос 2',
        completeAt: 84,
        items: [
          { x: 48, label: 'старт', color: 'gray' },
          { x: 78, label: 'ок 2', color: 'orange' },
        ],
      },
      {
        name: 'результат',
        completeAt: 88,
        items: [
          { x: 44, label: 'ок 1', color: 'blue' },
          { x: 78, label: 'ок 2', color: 'orange' },
        ],
      },
    ],
    steps: [
      { x: 14, text: 'Пришёл «шаг 1» — первый запрос сразу стартовал.' },
      { x: 26, text: 'Пришёл «шаг 2» — он встаёт в очередь и ждёт, пока закончится первый запрос.' },
      { x: 44, text: 'Первый запрос завершился — выдаём «ок 1».' },
      { x: 48, text: 'Только теперь из очереди запускается второй запрос.' },
      { x: 78, text: 'Второй запрос завершился — порядок ответов гарантированно совпал с порядком событий.' },
    ],
  },
  exhaustMap: {
    id: 'exhaustMap',
    title: 'exhaustMap — игнорирует новые клики, пока занят',
    tagline: 'Пока текущий запрос выполняется, все повторные нажатия просто отбрасываются',
    priority: 'Защита от повторов',
    color: '#437a22',
    bestFor: ['Кнопка «Оплатить» или «Отправить форму»', 'Кнопка входа (Login)', 'Обновление по кнопке'],
    danger: 'Не используйте для поиска или фильтров: изменения, сделанные во время загрузки, пропадут.',
    code: `submitClicks$.pipe(\n  exhaustMap(() => http.post('/api/orders', orderData))\n)`,
    tracks: [
      {
        name: 'клики',
        items: [
          { x: 14, label: 'клик 1', color: 'teal' },
          { x: 30, label: 'клик 2', color: 'red' },
          { x: 72, label: 'клик 3', color: 'teal' },
        ],
      },
      {
        name: 'запрос 1',
        completeAt: 54,
        items: [
          { x: 14, label: 'старт', color: 'gray' },
          { x: 50, label: 'заказ 1', color: 'blue' },
        ],
      },
      {
        name: 'клик 2',
        items: [{ x: 30, label: 'клик 2', kind: 'filtered' }],
      },
      {
        name: 'результат',
        completeAt: 92,
        items: [
          { x: 50, label: 'заказ 1', color: 'blue' },
          { x: 86, label: 'заказ 2', color: 'green' },
        ],
      },
    ],
    steps: [
      { x: 14, text: 'Пользователь нажал «Оплатить» (клик 1) — запрос ушёл на сервер.' },
      { x: 30, text: 'Пользователь случайно кликнул второй раз, пока запрос ещё идёт — exhaustMap игнорирует клик 2.' },
      { x: 50, text: 'Первый запрос спокойно завершился, заказ создан один раз.' },
      { x: 72, text: 'Поток снова свободен: новый клик 3 запускает следующий запрос.' },
      { x: 86, text: 'Второй заказ выполнен.' },
    ],
  },
};

const current = computed(() => STRATEGIES[activeOp.value]);
</script>

<template>
  <div class="ho-explorer">
    <div class="ho-tabs">
      <button
        v-for="s in STRATEGIES"
        :key="s.id"
        type="button"
        class="ho-tab"
        :class="{ active: activeOp === s.id }"
        :style="activeOp === s.id ? { borderColor: s.color, color: s.color } : {}"
        @click="activeOp = s.id"
      >
        <span class="tab-name">{{ s.id }}</span>
        <span class="tab-prio">{{ s.priority }}</span>
      </button>
    </div>

    <div class="ho-body">
      <div class="ho-diagram">
        <MarbleStream :tracks="current.tracks" :steps="current.steps" compact />
      </div>

      <div class="ho-side">
        <div class="comet-card">
          <div class="title-teal">Где пригодится</div>
          <ul class="ho-list">
            <li v-for="item in current.bestFor" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="comet-card">
          <div class="title-red">Где подведёт</div>
          <p class="ho-danger">{{ current.danger }}</p>
        </div>

        <div class="comet-card comet-card--code">
          <pre>{{ current.code }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ho-explorer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.ho-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.ho-tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 11px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid #dcdad2;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ho-tab.active {
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

.tab-name {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}

.tab-prio {
  font-size: 11px;
  color: #6e6c65;
}

.ho-body {
  display: grid;
  grid-template-columns: 1.38fr 1fr;
  gap: 12px;
  align-items: start;
}

.ho-side {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ho-side .comet-card {
  padding: 8px 12px;
}

.ho-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.38;
}

.ho-danger {
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
}

.comet-card--code pre {
  margin: 0;
  font-size: 11px;
  white-space: pre-wrap;
}
</style>
