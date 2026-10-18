/* eslint-disable @angular-eslint/component-selector */
import { Component, inject, input, signal } from '@angular/core';
import { take } from 'rxjs';
import { AppService } from './app.service';
import { LocalDBService, TopicType } from './localDB.service';

@Component({
  selector: 'button-delete-topic',
  template: `
    <div class="action-card">
      <button class="delete-btn" (click)="deleteTopic()">
        <ng-content />
      </button>
      @if (message()) {
        <div
          class="status-msg"
          [class.status-ok]="lastSuccess() === true"
          [class.status-err]="lastSuccess() === false">
          {{ message() }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .action-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .delete-btn {
        padding: 10px 16px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        background: #ffffff;
        color: #0f172a;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .delete-btn:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
      .status-msg {
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
      }
      .status-ok {
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }
      .status-err {
        background: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }
    `,
  ],
})
export class ButtonDeleteComponent {
  readonly topic = input.required<TopicType>();

  message = signal('');
  lastSuccess = signal<boolean | null>(null);

  private service = inject(AppService);

  deleteTopic() {
    this.service
      .deleteOldTopics(this.topic())
      .pipe(take(1))
      .subscribe((result) => {
        this.lastSuccess.set(result);
        this.message.set(
          result
            ? `All ${this.topic()} have been deleted`
            : `Error: deletion of some ${this.topic()} failed`,
        );
      });
  }
}

@Component({
  imports: [ButtonDeleteComponent],
  selector: 'app-root',
  template: `
    <main class="page">
      <section class="card">
        <header class="card-header">
          <div class="header-row">
            <span class="badge">Задача 3 · Агрегация потоков</span>
            <button type="button" class="reset-btn" (click)="resetDB()">
              ↻ Сбросить БД
            </button>
          </div>
          <h1>Пакетное удаление записей по категории</h1>
          <p class="subtitle">
            Запись <code>#6 (food)</code> защищена от удаления и возвращает
            <code>of(false)</code>. Нажмите <strong>Delete Food</strong>:
            почему интерфейс рапортует об успехе, хотя запись осталась в базе?
          </p>
        </header>

        <div class="records-grid">
          @for (info of allInfo(); track info.id) {
            <div
              class="record-item"
              [class.record-locked]="info.id === 6">
              <span class="record-id">#{{ info.id }}</span>
              <span class="record-topic">{{ info.topic }}</span>
              @if (info.id === 6) {
                <span class="lock-badge" title="Возвращает of(false)">
                  🔒 Сбой удаления (false)
                </span>
              }
            </div>
          } @empty {
            <div class="empty-db">Все записи удалены</div>
          }
        </div>

        <div class="actions-grid">
          <button-delete-topic topic="food">Delete Food</button-delete-topic>
          <button-delete-topic topic="sport">Delete Sport</button-delete-topic>
          <button-delete-topic topic="book">Delete Book</button-delete-topic>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        padding: 24px;
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif;
      }
      .card {
        width: 100%;
        max-width: 640px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
      }
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        background: #fef3c7;
        color: #b45309;
        font-size: 12px;
        font-weight: 600;
      }
      .reset-btn {
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        color: #334155;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .reset-btn:hover {
        background: #e2e8f0;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 22px;
        color: #0f172a;
      }
      .subtitle {
        margin: 0 0 20px;
        color: #475569;
        font-size: 14px;
        line-height: 1.5;
      }
      .records-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 8px;
        margin-bottom: 24px;
      }
      .record-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        background: #f1f5f9;
        font-size: 13px;
      }
      .record-locked {
        background: #fff1f2;
        border: 1px dashed #fda4af;
      }
      .record-id {
        font-weight: 700;
        color: #475569;
      }
      .record-topic {
        font-weight: 600;
        color: #0f172a;
      }
      .lock-badge {
        margin-left: auto;
        font-size: 11px;
        color: #be123c;
        font-weight: 600;
      }
      .empty-db {
        grid-column: 1 / -1;
        padding: 16px;
        text-align: center;
        color: #64748b;
      }
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
    `,
  ],
})
export class AppComponent {
  private service = inject(AppService);
  private dbService = inject(LocalDBService);

  allInfo = this.service.getAllInfo;

  resetDB() {
    this.dbService.reset();
  }
}
