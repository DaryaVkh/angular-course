<script setup lang="ts">
import { ref } from 'vue';

interface RowItem {
  situation: string;
  operator: string;
  snippet: string;
}

const rows: RowItem[] = [
  { situation: 'Подождать паузу и отсеять повторы ввода', operator: 'debounceTime + distinctUntilChanged', snippet: 'search$.pipe(debounceTime(300), distinctUntilChanged())' },
  { situation: 'Отменить прошлый запрос при новом событии', operator: 'switchMap', snippet: 'paramMap.pipe(switchMap(p => api.get(p)))' },
  { situation: 'Защитить кнопку от двойного клика', operator: 'exhaustMap', snippet: 'submit$.pipe(exhaustMap(() => api.post()))' },
  { situation: 'Сохранить строгую очередь запросов', operator: 'concatMap / concat', snippet: 'save$.pipe(concatMap(item => api.save(item)))' },
  { situation: 'Загружать по N файлов параллельно', operator: 'mergeMap(fn, N)', snippet: 'from(files).pipe(mergeMap(f => upload(f), 2))' },
  { situation: 'Объединить равные живые потоки', operator: 'combineLatest', snippet: 'combineLatest([filters$, queryParams$])' },
  { situation: 'Взять фоновое состояние только по клику', operator: 'withLatestFrom', snippet: 'saveClick$.pipe(withLatestFrom(role$))' },
  { situation: 'Дождаться завершения всех запросов разом', operator: 'forkJoin', snippet: 'forkJoin({ u: getUsers(), r: getRoles() })' },
  { situation: 'Перехватить ошибку и не убить поиск', operator: 'catchError внутри switchMap', snippet: 'switchMap(q => api(q).pipe(retry(1), catchError(() => of([]))))' },
  { situation: 'Накапливать состояние на каждом шаге', operator: 'scan', snippet: 'actions$.pipe(scan((state, a) => reducer(state, a), init))' },
];

const quizMode = ref(false);
const revealed = ref<Record<number, boolean>>({});
const selectedRow = ref<RowItem>(rows[0]);

function toggleRow(idx: number, row: RowItem) {
  selectedRow.value = row;
  if (quizMode.value) {
    revealed.value[idx] = !revealed.value[idx];
  }
}

function resetQuiz(val: boolean) {
  quizMode.value = val;
  revealed.value = {};
}
</script>

<template>
  <div class="matrix-layout">
    <div class="matrix-table comet-card">
      <div class="matrix-head">
        <span>ЗАДАЧА</span>
        <span>ОПЕРАТОР</span>
      </div>
      <div
        v-for="(r, i) in rows"
        :key="r.operator"
        class="matrix-row"
        :class="{ active: selectedRow.operator === r.operator }"
        @click="toggleRow(i, r)"
      >
        <span class="sit-cell">{{ r.situation }}</span>
        <span class="op-cell">
          <template v-if="!quizMode || revealed[i]">
            <code>{{ r.operator }}</code>
          </template>
          <template v-else>
            <span class="hidden-op">? Нажмите, чтобы проверить</span>
          </template>
        </span>
      </div>
    </div>

    <div class="matrix-side">
      <div class="comet-card">
        <div class="title-teal">Проверка себя</div>
        <p class="side-text">
          Скройте колонку с названиями и попробуйте вспомнить оператор по задаче:
        </p>
        <div class="quiz-btns">
          <button
            type="button"
            :class="{ active: !quizMode }"
            @click="resetQuiz(false)"
          >
            Шпаргалка открыта
          </button>
          <button
            type="button"
            :class="{ active: quizMode }"
            @click="resetQuiz(true)"
          >
            🎯 Блиц-проверка
          </button>
        </div>
      </div>

      <div class="comet-card comet-card--code">
        <div class="title-green">{{ selectedRow.operator }}</div>
        <div class="text-xs opacity-75 mb-2">{{ selectedRow.situation }}</div>
        <pre>{{ selectedRow.snippet }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matrix-layout {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 14px;
}

.matrix-table {
  padding: 0;
  overflow: hidden;
}

.matrix-head {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  padding: 6px 12px;
  background: #e2ede6;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: #01696f;
  letter-spacing: 0.06em;
}

.matrix-row {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  padding: 4.5px 12px;
  border-top: 1px solid #e6e4dc;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.matrix-row:hover,
.matrix-row.active {
  background: #f0f5f2;
}

.op-cell code {
  font-family: var(--font-mono);
  font-weight: 700;
  color: #01696f;
  font-size: 11.5px;
}

.hidden-op {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #da7101;
  font-weight: 600;
}

.matrix-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-text {
  font-size: 12.5px;
  color: #6e6c65;
  margin-bottom: 8px;
}

.quiz-btns {
  display: flex;
  gap: 6px;
}

.quiz-btns button {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 8px;
  border-radius: 7px;
  border: 1px solid #d5d3ca;
  background: #f7f6f2;
  cursor: pointer;
}

.quiz-btns button.active {
  background: #01696f;
  color: #fff;
  border-color: #01696f;
}

.comet-card--code pre {
  margin: 0;
  font-size: 11.5px;
  white-space: pre-wrap;
}
</style>
