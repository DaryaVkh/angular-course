<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';

export interface MarblePoint {
  x: number; // от 5 до 92 (%)
  label?: string;
  color?: 'teal' | 'blue' | 'orange' | 'green' | 'red' | 'gray';
  kind?: 'marble' | 'cancel' | 'error' | 'filtered';
  detail?: string;
}

export interface MarbleTrack {
  name: string;
  items: MarblePoint[];
  completeAt?: number; // % по шкале
  errorAt?: number; // % по шкале
}

export interface MarbleStep {
  x: number;
  text: string;
}

const props = withDefaults(
  defineProps<{
    tracks: MarbleTrack[];
    interactive?: boolean;
    compact?: boolean;
    pipeline?: boolean;
    steps?: MarbleStep[];
  }>(),
  {
    interactive: true,
    compact: false,
    pipeline: false,
    steps: undefined,
  }
);

const activeItem = ref<{ track: string; point: MarblePoint } | null>(null);
const currentStepIdx = ref<number | null>(null);
const isPlaying = ref(false);

let timer: ReturnType<typeof setInterval> | null = null;

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isPlaying.value = false;
}

onBeforeUnmount(() => {
  stopTimer();
});

// Собираем шаги по уникальным координатам X или из props.steps
const computedSteps = computed<MarbleStep[]>(() => {
  if (props.steps && props.steps.length > 0) {
    return props.steps;
  }

  const xSet = new Set<number>();
  for (const t of props.tracks) {
    for (const item of t.items) {
      xSet.add(item.x);
    }
  }
  const sortedX = Array.from(xSet).sort((a, b) => a - b);

  return sortedX.map((x, idx) => {
    const parts: string[] = [];
    for (const t of props.tracks) {
      const found = t.items.filter((i) => i.x === x);
      for (const p of found) {
        if (p.detail) {
          parts.push(`${t.name}: ${p.detail}`);
        } else if (p.kind === 'filtered') {
          parts.push(`${t.name}: значение ${p.label ?? ''} отсеяно`);
        } else if (p.kind === 'cancel') {
          parts.push(`${t.name}: поток отменён (✕)`);
        } else if (p.kind === 'error') {
          parts.push(`${t.name}: ошибка (✕)`);
        } else if (p.label) {
          parts.push(`${t.name} → ${p.label}`);
        }
      }
    }
    return {
      x,
      text: parts.join(' · ') || `Шаг ${idx + 1}`,
    };
  });
});

const currentStep = computed<MarbleStep | null>(() => {
  if (currentStepIdx.value === null) return null;
  return computedSteps.value[currentStepIdx.value] || null;
});

function toggleAutoPlay() {
  if (isPlaying.value) {
    stopTimer();
    return;
  }

  activeItem.value = null;
  if (
    currentStepIdx.value === null ||
    currentStepIdx.value >= computedSteps.value.length - 1
  ) {
    currentStepIdx.value = 0;
  }

  isPlaying.value = true;
  timer = setInterval(() => {
    if (currentStepIdx.value === null) {
      currentStepIdx.value = 0;
    } else if (currentStepIdx.value < computedSteps.value.length - 1) {
      currentStepIdx.value += 1;
    } else {
      stopTimer();
    }
  }, 1350);
}

function stepNext() {
  stopTimer();
  activeItem.value = null;
  if (currentStepIdx.value === null) {
    currentStepIdx.value = 0;
  } else if (currentStepIdx.value < computedSteps.value.length - 1) {
    currentStepIdx.value += 1;
  } else {
    currentStepIdx.value = null;
  }
}

function stepPrev() {
  stopTimer();
  activeItem.value = null;
  if (currentStepIdx.value === null) {
    currentStepIdx.value = computedSteps.value.length - 1;
  } else if (currentStepIdx.value > 0) {
    currentStepIdx.value -= 1;
  } else {
    currentStepIdx.value = null;
  }
}

function resetView() {
  stopTimer();
  currentStepIdx.value = null;
  activeItem.value = null;
}

function selectPoint(trackName: string, p: MarblePoint) {
  if (!props.interactive) return;
  stopTimer();
  const stepIndex = computedSteps.value.findIndex((s) => s.x === p.x);
  if (activeItem.value?.point === p) {
    activeItem.value = null;
    currentStepIdx.value = null;
  } else {
    activeItem.value = { track: trackName, point: p };
    if (stepIndex >= 0) {
      currentStepIdx.value = stepIndex;
    }
  }
}

const colorMap: Record<string, string> = {
  teal: '#01696f',
  blue: '#006494',
  orange: '#da7101',
  green: '#437a22',
  red: '#a13544',
  gray: '#8c8980',
};

function getColor(c?: string) {
  return colorMap[c || 'teal'] || '#01696f';
}

function isFuturePoint(x: number): boolean {
  if (currentStep.value === null) return false;
  return x > currentStep.value.x;
}

function isCurrentPoint(x: number): boolean {
  if (currentStep.value === null) return false;
  return x === currentStep.value.x;
}
</script>

<template>
  <div class="marble-diagram" :class="{ 'is-compact': compact }">
    <div v-if="interactive" class="marble-toolbar">
      <div class="toolbar-actions">
        <button type="button" class="play-btn" @click="toggleAutoPlay">
          <span>{{ isPlaying ? '⏸ Пауза' : '▶ Показать по шагам' }}</span>
        </button>
        <button
          type="button"
          class="step-btn"
          title="Предыдущий шаг"
          @click="stepPrev"
        >
          ←
        </button>
        <button
          type="button"
          class="step-btn"
          title="Следующий шаг"
          @click="stepNext"
        >
          Шаг →
        </button>
        <button
          v-if="currentStepIdx !== null"
          type="button"
          class="reset-btn"
          @click="resetView"
        >
          Показать всё
        </button>
      </div>

      <span class="toolbar-hint">
        <template v-if="currentStepIdx !== null">
          Шаг {{ currentStepIdx + 1 }} из {{ computedSteps.length }}
        </template>
        <template v-else>
          Нажмите «Показать по шагам» или кликните на кружок
        </template>
      </span>
    </div>

    <div class="tracks-list">
      <!-- Вертикальная подсветка текущего шага -->
      <div v-for="(t, tIdx) in tracks" :key="t.name" class="track-row">
        <div class="track-label" :title="t.name">{{ t.name }}</div>
        <div class="track-line-wrap">
          <div class="track-line" />
          <div class="track-arrow" />

          <!-- Подсветка активной колонки времени -->
          <div
            v-if="currentStep !== null"
            class="step-column-highlight"
            :style="{ left: `${currentStep.x}%` }"
          />

          <!-- Отметка complete (|) -->
          <div
            v-if="t.completeAt"
            class="track-complete"
            :class="{ 'is-future': isFuturePoint(t.completeAt) }"
            :style="{ left: `${t.completeAt}%` }"
            title="complete() — поток успешно завершился"
          />

          <!-- Отметка error (✕) -->
          <div
            v-if="t.errorAt"
            class="track-error-mark"
            :class="{ 'is-future': isFuturePoint(t.errorAt) }"
            :style="{ left: `${t.errorAt}%` }"
            title="error() — поток завершился с ошибкой"
          >
            ✕
          </div>

          <!-- Значения на потоке -->
          <template v-for="(p, idx) in t.items" :key="idx">
            <!-- Вертикальная стрелка вниз в режиме конвейера (pipeline) -->
            <div
              v-if="
                pipeline &&
                tIdx > 0 &&
                tracks[tIdx - 1].items.some((prev) => prev.x === p.x && prev.kind !== 'filtered')
              "
              class="pipeline-connector"
              :class="{
                'is-future': isFuturePoint(p.x),
                'is-active': isCurrentPoint(p.x),
              }"
              :style="{ left: `${p.x}%` }"
            >
              ↓
            </div>

            <button
              type="button"
              class="marble-node"
              :class="{
                'is-cancel': p.kind === 'cancel' || p.kind === 'error',
                'is-filtered': p.kind === 'filtered',
                'is-selected': activeItem?.point === p || isCurrentPoint(p.x),
                'is-future': isFuturePoint(p.x),
              }"
              :style="{ left: `${p.x}%` }"
              @click="selectPoint(t.name, p)"
            >
              <span
                v-if="p.kind === 'cancel' || p.kind === 'error'"
                class="cancel-badge"
              >
                {{ p.label ? `${p.label} ✕` : '✕' }}
              </span>
              <span
                v-else-if="p.kind === 'filtered'"
                class="filtered-badge"
                title="Значение отсеяно оператором"
              >
                {{ p.label }} ✕
              </span>
              <span
                v-else
                class="marble-pill"
                :style="{ backgroundColor: getColor(p.color) }"
              >
                {{ p.label }}
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Пояснение текущего шага или выбранного элемента -->
    <div v-if="currentStep || activeItem" class="marble-inspector">
      <span class="inspector-badge">
        {{ currentStepIdx !== null ? `Шаг ${currentStepIdx + 1}` : 'Событие' }}
      </span>
      <div class="inspector-content">
        <template v-if="activeItem && activeItem.point.detail">
          <strong>{{ activeItem.track }}:</strong>
          <span>{{ activeItem.point.detail }}</span>
        </template>
        <template v-else-if="currentStep">
          <span>{{ currentStep.text }}</span>
        </template>
      </div>
      <button type="button" class="inspector-close" @click="resetView">✕</button>
    </div>
  </div>
</template>

<style scoped>
.marble-diagram {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 11px 15px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(215, 212, 202, 0.95);
}

.marble-diagram.is-compact {
  padding: 8px 13px;
  gap: 6px;
}

.marble-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.play-btn,
.step-btn,
.reset-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  border-radius: 7px;
  padding: 3px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.play-btn {
  color: #ffffff;
  background: #01696f;
  border: 1px solid #01696f;
}

.play-btn:hover {
  background: #015055;
}

.step-btn {
  color: #171614;
  background: #ebe9e2;
  border: 1px solid #d2cfc6;
}

.step-btn:hover {
  border-color: #01696f;
  color: #01696f;
}

.reset-btn {
  color: #6e6c65;
  background: transparent;
  border: 1px solid #d2cfc6;
}

.reset-btn:hover {
  color: #171614;
  background: #ebe9e2;
}

.toolbar-hint {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #6e6c65;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.is-compact .tracks-list {
  gap: 10px;
}

.track-row {
  display: grid;
  grid-template-columns: 115px 1fr;
  align-items: center;
  gap: 12px;
  min-height: 28px;
}

.is-compact .track-row {
  grid-template-columns: 105px 1fr;
  min-height: 26px;
}

.track-label {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: #3a372f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-line-wrap {
  position: relative;
  height: 28px;
  display: flex;
  align-items: center;
}

.track-line {
  width: 100%;
  height: 2px;
  background: #b5b2a8;
}

.track-arrow {
  position: absolute;
  right: -1px;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 7px solid #b5b2a8;
}

.step-column-highlight {
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 30px;
  transform: translateX(-50%);
  background: rgba(1, 105, 111, 0.11);
  border-radius: 6px;
  pointer-events: none;
  z-index: 1;
}

.pipeline-connector {
  position: absolute;
  top: -13px;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #8c8980;
  pointer-events: none;
  z-index: 1;
  line-height: 1;
}

.pipeline-connector.is-active {
  color: #01696f;
  transform: translateX(-50%) scale(1.2);
}

.pipeline-connector.is-future {
  opacity: 0.2;
}

.track-complete {
  position: absolute;
  width: 3px;
  height: 20px;
  background: #437a22;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: opacity 0.2s ease;
}

.track-error-mark {
  position: absolute;
  transform: translate(-50%, -1px);
  color: #a13544;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 15px;
  transition: opacity 0.2s ease;
}

.marble-node {
  position: absolute;
  transform: translateX(-50%);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: opacity 0.2s ease, transform 0.18s ease;
}

.marble-node.is-future,
.track-complete.is-future,
.track-error-mark.is-future {
  opacity: 0.22;
}

.marble-pill {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1.5px solid rgba(23, 22, 20, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.marble-node:hover .marble-pill,
.marble-node.is-selected .marble-pill {
  transform: scale(1.14);
  box-shadow: 0 0 0 3px rgba(1, 105, 111, 0.28);
}

.filtered-badge {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  color: #8c8980;
  background: #eceae3;
  border: 1px dashed #b5b2a8;
  padding: 1px 6px;
  border-radius: 999px;
  white-space: nowrap;
}

.cancel-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #a13544;
  background: #f5e1e4;
  border: 1px solid rgba(161, 53, 68, 0.35);
  padding: 1px 6px;
  border-radius: 999px;
  white-space: nowrap;
}

.marble-inspector {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 11px;
  border-radius: 8px;
  background: #e3ece8;
  border: 1px solid rgba(1, 105, 111, 0.28);
  font-size: 12px;
  color: #171614;
}

.inspector-badge {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #ffffff;
  background: #01696f;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.inspector-content {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex: 1;
  line-height: 1.35;
}

.inspector-content strong {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: #01696f;
}

.inspector-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6e6c65;
  font-size: 13px;
  padding: 0 2px;
}
</style>
