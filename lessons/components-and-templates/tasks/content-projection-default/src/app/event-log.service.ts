import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EventLogService {
  readonly entries = signal<string[]>([]);

  log(message: string): void {
    const time = new Date().toLocaleTimeString();
    this.entries.update((entries) => [`${time} — ${message}`, ...entries].slice(0, 20));
  }
}
