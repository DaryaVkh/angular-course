<script setup lang="ts">
import { ref, computed } from 'vue';
import RxMiniApp, { MiniAppScenario } from './RxMiniApp.vue';

const activeOp = ref<'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap'>('switchMap');

interface StrategyInfo {
  id: 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap';
  scenario: MiniAppScenario;
  title: string;
  priority: string;
  color: string;
  bestFor: string[];
  danger: string;
  code: string;
}

const STRATEGIES: Record<string, StrategyInfo> = {
  switchMap: {
    id: 'switchMap',
    scenario: 'ho-switch',
    title: 'switchMap — отменяет прошлый запрос',
    priority: 'Только актуальное',
    color: '#01696f',
    bestFor: ['Поиск по мере ввода', 'Переключение карточек товаров и вкладок'],
    danger: 'Не подходит для сохранения и удаления: новое событие оборвёт запрос на полпути.',
    code: `productId$.pipe(\n  switchMap(id => http.get('/api/items/' + id))\n)`,
  },
  mergeMap: {
    id: 'mergeMap',
    scenario: 'ho-merge',
    title: 'mergeMap — запускает всё параллельно',
    priority: 'Скорость',
    color: '#006494',
    bestFor: ['Загрузка независимых котировок и виджетов', 'Отправка аналитики'],
    danger: 'В поиске приводит к гонке: медленный старый ответ перезапишет свежий.',
    code: `from(['ETH', 'GOLD', 'BTC']).pipe(\n  mergeMap(ticker => http.get('/api/quote/' + ticker))\n)`,
  },
  concatMap: {
    id: 'concatMap',
    scenario: 'ho-concat',
    title: 'concatMap — строгая очередь',
    priority: 'По порядку',
    color: '#da7101',
    bestFor: ['Пошаговое сохранение формы', 'Загрузка файлов строго друг за другом'],
    danger: 'Если один запрос зависнет, вся очередь за ним будет ждать.',
    code: `steps$.pipe(\n  concatMap(step => http.post('/api/save', step))\n)`,
  },
  exhaustMap: {
    id: 'exhaustMap',
    scenario: 'ho-exhaust',
    title: 'exhaustMap — игнорирует клики, пока занят',
    priority: 'Без дублей',
    color: '#437a22',
    bestFor: ['Кнопка «Оплатить заказ»', 'Кнопка входа (Login)'],
    danger: 'Не используйте для фильтров: изменения во время загрузки просто пропадут.',
    code: `payClicks$.pipe(\n  exhaustMap(() => http.post('/api/checkout', cart))\n)`,
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
        <RxMiniApp :scenario="current.scenario" />
      </div>

      <div class="ho-side">
        <div class="comet-card">
          <div class="title-teal">Где используем</div>
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
  gap: 10px;
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
  background: rgba(255, 255, 255, 0.85);
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
  grid-template-columns: 1.32fr 1fr;
  gap: 12px;
  align-items: start;
}

.ho-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ho-side .comet-card {
  padding: 9px 12px;
}

.ho-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.4;
}

.ho-danger {
  margin: 0;
  font-size: 12px;
  line-height: 1.38;
}

.comet-card--code pre {
  margin: 0;
  font-size: 11px;
  white-space: pre-wrap;
}
</style>
