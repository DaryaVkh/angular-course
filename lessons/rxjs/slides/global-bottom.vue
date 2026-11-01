<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNav } from '@slidev/client';
import {
  QUEST_MISSIONS,
  questState,
  completedCount,
  totalMissions,
  resetQuestProgress,
} from './components/questStore';

const nav = useNav();
const showQuestMap = ref(false);

const currentPage = computed(() => nav.currentPage.value || 1);

const currentSectionTitle = computed(() => {
  const p = currentPage.value;
  if (p <= 1) return '';
  if (p <= 9) return 'ДОБРО ПОЖАЛОВАТЬ В RX';
  if (p <= 15) return 'БАЗОВЫЕ ЭЛЕМЕНТЫ';
  if (p <= 20) return 'ОПЕРАТОРЫ СОЗДАНИЯ';
  if (p <= 27) return 'ЦЕПОЧКА PIPE И ОПЕРАТОРЫ';
  if (p <= 32) return 'ПОТОКИ ВНУТРИ ПОТОКОВ';
  if (p <= 39) return 'ОБЪЕДИНЕНИЕ ПОТОКОВ';
  if (p <= 43) return 'ОШИБКИ И ЗАВЕРШЕНИЕ';
  if (p <= 47) return 'МНОГОАДРЕСНЫЕ ПОТОКИ И КЕШ';
  if (p <= 51) return 'СОСТОЯНИЕ И ЭФФЕКТЫ';
  if (p <= 55) return 'RXJS В ANGULAR';
  if (p <= 60) return 'ПРАКТИЧЕСКИЕ РЕЦЕПТЫ';
  return 'ИТОГИ';
});

const isDarkSlide = computed(() => {
  const p = currentPage.value;
  return [1, 2, 10, 16, 21, 28, 33, 40, 44, 48, 52, 56, 62].includes(p);
});

function goToSlide(slideIndex: number) {
  nav.go(slideIndex);
  showQuestMap.value = false;
}
</script>

<template>
  <!-- Верхний мини-индикатор заданий -->
  <div class="quest-hud-top" :class="{ 'is-dark': isDarkSlide }">
    <button
      type="button"
      class="quest-pill-btn"
      title="Открыть список практических заданий"
      @click="showQuestMap = !showQuestMap"
    >
      <span class="cat-mini-dot" :class="{ 'all-done': completedCount === totalMissions }" />
      <span class="quest-pill-label">ЗАДАНИЯ:</span>
      <span class="quest-pill-score">{{ completedCount }}/{{ totalMissions }}</span>
      <span class="quest-dots">
        <span
          v-for="m in QUEST_MISSIONS"
          :key="m.id"
          class="q-dot"
          :class="{
            'is-done': questState.completedIds.includes(m.id),
            'is-current': currentPage === m.slideIndex,
          }"
        />
      </span>
    </button>
  </div>

  <!-- Выпадающая карта заданий для быстрого перехода на лекции -->
  <div v-if="showQuestMap" class="quest-map-modal" @click.self="showQuestMap = false">
    <div class="quest-map-card">
      <div class="quest-map-header">
        <div>
          <span class="comet-pill comet-pill--quest">ПРАКТИКА НА ЛЕКЦИИ</span>
          <h3>Карта заданий по разделам (12 задач)</h3>
        </div>
        <div class="quest-map-actions">
          <button type="button" class="reset-btn" @click="resetQuestProgress">
            Сбросить прогресс
          </button>
          <button type="button" class="close-btn" @click="showQuestMap = false">✕</button>
        </div>
      </div>

      <div class="quest-map-grid">
        <button
          v-for="m in QUEST_MISSIONS"
          :key="m.id"
          type="button"
          class="mission-item"
          :class="{
            'is-done': questState.completedIds.includes(m.id),
            'is-active': currentPage === m.slideIndex,
          }"
          @click="goToSlide(m.slideIndex)"
        >
          <div class="mission-top">
            <span class="mission-code">{{ m.code }}</span>
            <span class="mission-status">
              {{ questState.completedIds.includes(m.id) ? '✓ РЕШЕНО' : 'ОЖИДАЕТ' }}
            </span>
          </div>
          <strong>{{ m.title }}</strong>
          <small>{{ m.section }} · Слайд {{ m.slideIndex }}</small>
        </button>
      </div>
    </div>
  </div>

  <!-- Нижний колонтитул -->
  <footer class="comet-footer" :class="{ 'is-dark': isDarkSlide }">
    <div class="footer-left">АТКИШКИН ВЛАДИСЛАВ / ФИИТ / ТОЧКА БАНК</div>
    <div class="footer-right">
      <span v-if="currentSectionTitle" class="footer-section">{{ currentSectionTitle }}</span>
      <span class="footer-page">{{ currentPage }}</span>
    </div>
  </footer>
</template>

<style scoped>
.quest-hud-top {
  position: fixed;
  top: 14px;
  right: 28px;
  z-index: 40;
  font-family: var(--font-mono);
}

.quest-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #d5d3ca;
  color: #171614;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.quest-hud-top.is-dark .quest-pill-btn {
  background: rgba(32, 31, 29, 0.85);
  border-color: #3a372f;
  color: #f7f6f2;
}

.quest-pill-btn:hover {
  border-color: #01696f;
  transform: translateY(-1px);
}

.cat-mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #da7101;
}

.cat-mini-dot.all-done {
  background: #437a22;
}

.quest-pill-label {
  letter-spacing: 0.05em;
  opacity: 0.75;
}

.quest-pill-score {
  color: #01696f;
  font-weight: 700;
}

.quest-hud-top.is-dark .quest-pill-score {
  color: #4f98a3;
}

.quest-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 2px;
}

.q-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(110, 108, 101, 0.3);
  transition: all 0.2s ease;
}

.q-dot.is-done {
  background: #437a22;
}

.q-dot.is-current {
  outline: 2px solid #da7101;
  outline-offset: 1px;
}

.quest-map-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(23, 22, 20, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: var(--font-main);
}

.quest-map-card {
  background: #f2f1ec;
  color: #171614;
  border: 1px solid #d5d3ca;
  border-radius: 16px;
  padding: 20px 24px;
  width: 100%;
  max-width: 820px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.quest-map-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.quest-map-header h3 {
  margin: 4px 0 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.quest-map-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d5d3ca;
  background: #fff;
  color: #6e6c65;
  cursor: pointer;
}

.reset-btn:hover {
  color: #a13544;
  border-color: #a13544;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6e6c65;
  padding: 4px 8px;
}

.quest-map-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.mission-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #dcdad2;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.mission-item:hover {
  border-color: #01696f;
  transform: translateY(-1px);
}

.mission-item.is-done {
  background: #e2ede6;
  border-color: rgba(67, 122, 34, 0.4);
}

.mission-item.is-active {
  outline: 2px solid #da7101;
}

.mission-top {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
}

.mission-code {
  color: #01696f;
}

.mission-status {
  color: #6e6c65;
}

.mission-item.is-done .mission-status {
  color: #437a22;
}

.mission-item strong {
  font-size: 0.88rem;
  color: #171614;
}

.mission-item small {
  font-size: 0.72rem;
  color: #6e6c65;
}

.comet-footer {
  position: fixed;
  bottom: 12px;
  left: 48px;
  right: 48px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: #6e6c65;
  pointer-events: none;
}

.comet-footer.is-dark {
  color: #9f9d96;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 24px;
}
</style>
