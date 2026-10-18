import { reactive, computed } from 'vue';

export interface QuestMissionInfo {
  id: number;
  code: string;
  title: string;
  section: string;
  slideIndex: number;
}

export const QUEST_MISSIONS: QuestMissionInfo[] = [
  { id: 1, code: 'M01', title: 'Запуск потока', section: 'Добро пожаловать в RX', slideIndex: 9 },
  { id: 2, code: 'M02', title: 'Начальное значение', section: 'Базовые элементы', slideIndex: 15 },
  { id: 3, code: 'M03', title: 'Массив по элементам', section: 'Операторы создания', slideIndex: 20 },
  { id: 4, code: 'M04', title: 'Порядок в pipe()', section: 'Цепочка pipe и операторы', slideIndex: 27 },
  { id: 5, code: 'M05', title: 'Поиск и оплата', section: 'Потоки внутри потоков', slideIndex: 32 },
  { id: 6, code: 'M06', title: 'Кеш + сервер и фильтры', section: 'Объединение потоков', slideIndex: 36 },
  { id: 7, code: 'M07', title: 'Клик + текущая роль', section: 'Объединение потоков', slideIndex: 39 },
  { id: 8, code: 'M08', title: 'catchError внутри switchMap', section: 'Ошибки и завершение', slideIndex: 43 },
  { id: 9, code: 'M09', title: 'Кеширование через shareReplay', section: 'Многоадресные потоки и кеш', slideIndex: 47 },
  { id: 10, code: 'M10', title: 'Состояние scan и эффекты', section: 'Накопление состояния', slideIndex: 51 },
  { id: 11, code: 'M11', title: 'Отписка в ngOnInit', section: 'RxJS в Angular', slideIndex: 55 },
  { id: 12, code: 'M12', title: 'Финал: оператор liveSearch', section: 'Практические проекты', slideIndex: 60 },
];

const STORAGE_KEY = 'comet-rxjs-quest-v3';

function loadInitialCompleted(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const questState = reactive({
  completedIds: loadInitialCompleted() as number[],
  catMood: 'idle' as 'idle' | 'working' | 'tangled' | 'success' | 'error' | 'sleeping',
});

export function markMissionCompleted(id: number) {
  if (!questState.completedIds.includes(id)) {
    questState.completedIds.push(id);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questState.completedIds));
      } catch {
        // ignore storage errors
      }
    }
  }
  questState.catMood = 'success';
}

export function isMissionCompleted(id: number): boolean {
  return questState.completedIds.includes(id);
}

export function resetQuestProgress() {
  questState.completedIds.splice(0, questState.completedIds.length);
  questState.catMood = 'idle';
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export const completedCount = computed(() => questState.completedIds.length);
export const totalMissions = QUEST_MISSIONS.length;
export const progressPercent = computed(() =>
  Math.round((questState.completedIds.length / QUEST_MISSIONS.length) * 100)
);
