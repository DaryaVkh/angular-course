<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    mood?: 'idle' | 'sleeping' | 'working' | 'tangled' | 'success' | 'error';
    size?: number;
    caption?: string;
    dark?: boolean;
  }>(),
  {
    mood: 'idle',
    size: 88,
    caption: '',
    dark: false,
  }
);

const statusColor = computed(() => {
  switch (props.mood) {
    case 'success':
      return '#437a22';
    case 'error':
      return '#a13544';
    case 'tangled':
    case 'working':
      return '#da7101';
    case 'sleeping':
      return '#4f98a3';
    default:
      return '#01696f';
  }
});

const statusLabel = computed(() => {
  switch (props.mood) {
    case 'success':
      return 'ГОТОВО';
    case 'error':
      return 'ОШИБКА';
    case 'tangled':
      return 'СБОЙ';
    case 'working':
      return 'В РАБОТЕ';
    case 'sleeping':
      return 'ЖДЁТ ЗАПУСКА';
    default:
      return 'КОТ КОМЕТ';
  }
});
</script>

<template>
  <div class="comet-cat-wrap" :class="{ 'is-dark': dark, [`mood-${mood}`]: true }">
    <div class="cat-avatar" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="cat-svg"
      >
        <!-- Фоновое кольцо-индикатор статуса -->
        <circle
          cx="60"
          cy="62"
          r="48"
          :stroke="statusColor"
          stroke-width="2.5"
          stroke-dasharray="6 4"
          class="orbit-ring"
        />

        <!-- Если кот запутался в потоках (tangled) — рисуем пересекающиеся реактивные линии -->
        <g v-if="mood === 'tangled'" class="tangled-wires">
          <path
            d="M12 45 C 40 20, 80 95, 108 50"
            stroke="#da7101"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"
          />
          <path
            d="M15 78 C 50 95, 75 25, 106 72"
            stroke="#a13544"
            stroke-width="2.5"
            stroke-dasharray="4 3"
            stroke-linecap="round"
            fill="none"
          />
          <circle cx="24" cy="39" r="4.5" fill="#da7101" />
          <circle cx="96" cy="58" r="4.5" fill="#a13544" />
        </g>

        <!-- Хвост кота-антенна с мраморным шариком на конце -->
        <path
          d="M88 86 C 103 82, 108 64, 98 52"
          stroke="#201f1d"
          stroke-width="6"
          stroke-linecap="round"
          class="cat-tail"
        />
        <circle cx="98" cy="50" r="6" :fill="statusColor" class="tail-marble" />

        <!-- Тело котика в инженерном жилете -->
        <path
          d="M34 98 C 34 78, 86 78, 86 98 Z"
          fill="#201f1d"
        />
        <!-- Бирюзовый воротник-шарф Точка/Comet -->
        <path
          d="M40 83 Q 60 91 80 83 L 83 91 Q 60 98 37 91 Z"
          :fill="statusColor"
        />

        <!-- Уши -->
        <polygon points="30,52 24,22 48,36" fill="#201f1d" stroke="#3a372f" stroke-width="1.5" />
        <polygon points="32,47 28,28 44,37" :fill="statusColor" opacity="0.85" />

        <polygon points="90,52 96,22 72,36" fill="#201f1d" stroke="#3a372f" stroke-width="1.5" />
        <polygon points="88,47 92,28 76,37" :fill="statusColor" opacity="0.85" />

        <!-- Голова -->
        <rect
          x="26"
          y="34"
          width="68"
          height="52"
          rx="24"
          fill="#201f1d"
          stroke="#3a372f"
          stroke-width="2"
        />

        <!-- Инженерные очки-визор на лбу -->
        <g class="visor">
          <rect x="33" y="31" width="24" height="11" rx="5.5" fill="#171614" :stroke="statusColor" stroke-width="2" />
          <rect x="63" y="31" width="24" height="11" rx="5.5" fill="#171614" :stroke="statusColor" stroke-width="2" />
          <line x1="57" y1="36" x2="63" y2="36" :stroke="statusColor" stroke-width="2" />
          <line x1="36" y1="35" x2="43" y2="35" stroke="#f7f6f2" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
          <line x1="66" y1="35" x2="73" y2="35" stroke="#f7f6f2" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
        </g>

        <!-- ГЛАЗА в зависимости от состояния -->
        <!-- Спит (Cold Observable до subscribe) -->
        <g v-if="mood === 'sleeping'">
          <path d="M38 58 Q 45 64 52 58" stroke="#f7f6f2" stroke-width="2.8" stroke-linecap="round" fill="none" />
          <path d="M68 58 Q 75 64 82 58" stroke="#f7f6f2" stroke-width="2.8" stroke-linecap="round" fill="none" />
        </g>

        <!-- Ошибка (error) -->
        <g v-else-if="mood === 'error'">
          <path d="M40 53 L50 63 M50 53 L40 63" stroke="#a13544" stroke-width="3" stroke-linecap="round" />
          <path d="M70 53 L80 63 M80 53 L70 63" stroke="#a13544" stroke-width="3" stroke-linecap="round" />
        </g>

        <!-- Запутался в гонке / утечке (tangled) -->
        <g v-else-if="mood === 'tangled'">
          <circle cx="45" cy="58" r="7" stroke="#da7101" stroke-width="2.2" fill="none" />
          <circle cx="43" cy="56" r="2.5" fill="#f7f6f2" />
          <circle cx="75" cy="58" r="7" stroke="#da7101" stroke-width="2.2" fill="none" />
          <circle cx="77" cy="60" r="2.5" fill="#f7f6f2" />
        </g>

        <!-- Успех (success) -->
        <g v-else-if="mood === 'success'">
          <path d="M38 60 Q 45 51 52 60" stroke="#6daa45" stroke-width="3" stroke-linecap="round" fill="none" />
          <path d="M68 60 Q 75 51 82 60" stroke="#6daa45" stroke-width="3" stroke-linecap="round" fill="none" />
        </g>

        <!-- Обычный или рабочий режим (idle / working) -->
        <g v-else>
          <circle cx="45" cy="58" r="6" fill="#f7f6f2" />
          <circle cx="46" cy="58" r="3" fill="#01696f" />
          <circle cx="44" cy="56" r="1.3" fill="#ffffff" />

          <circle cx="75" cy="58" r="6" fill="#f7f6f2" />
          <circle cx="76" cy="58" r="3" fill="#01696f" />
          <circle cx="74" cy="56" r="1.3" fill="#ffffff" />
        </g>

        <!-- Носик и ротик -->
        <polygon points="57,66 63,66 60,70" :fill="mood === 'error' ? '#a13544' : '#da7101'" />
        <path
          v-if="mood === 'error' || mood === 'tangled'"
          d="M53 75 Q 60 71 67 75"
          stroke="#f7f6f2"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <path
          v-else
          d="M52 72 Q 56 76 60 72 Q 64 76 68 72"
          stroke="#f7f6f2"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />

        <!-- Усы -->
        <line x1="16" y1="62" x2="30" y2="64" stroke="#9f9d96" stroke-width="1.6" stroke-linecap="round" />
        <line x1="15" y1="69" x2="30" y2="69" stroke="#9f9d96" stroke-width="1.6" stroke-linecap="round" />
        <line x1="104" y1="62" x2="90" y2="64" stroke="#9f9d96" stroke-width="1.6" stroke-linecap="round" />
        <line x1="105" y1="69" x2="90" y2="69" stroke="#9f9d96" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <span class="cat-badge" :style="{ backgroundColor: statusColor }">{{ statusLabel }}</span>
    </div>
    <div v-if="caption" class="cat-caption">
      {{ caption }}
    </div>
  </div>
</template>

<style scoped>
.comet-cat-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.cat-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.orbit-ring {
  transform-origin: 60px 62px;
  transition: stroke 0.3s ease;
}

.mood-working .orbit-ring,
.mood-tangled .orbit-ring {
  animation: spin-orbit 8s linear infinite;
}

.mood-success .cat-svg {
  animation: cat-bounce 0.6s ease;
}

.cat-tail {
  transform-origin: 88px 86px;
  animation: tail-wag 3.2s ease-in-out infinite;
}

.zzz {
  animation: float-z 2s ease-in-out infinite;
}

@keyframes spin-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes tail-wag {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

@keyframes cat-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

@keyframes float-z {
  0%, 100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.cat-badge {
  position: absolute;
  bottom: -4px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #f7f6f2;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.cat-caption {
  font-size: 0.78rem;
  color: var(--comet-text-muted);
  text-align: center;
  max-width: 180px;
  line-height: 1.3;
}

.is-dark .cat-caption {
  color: var(--comet-text-light-muted);
}
</style>
