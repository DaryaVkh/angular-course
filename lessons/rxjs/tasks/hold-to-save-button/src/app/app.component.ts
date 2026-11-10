import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Holdable } from './holdable.directive';

@Component({
  imports: [Holdable],
  selector: 'app-root',
  template: `
    <main class="flex h-screen items-center justify-center">
      <div
        class="flex w-full max-w-screen-sm flex-col items-center gap-y-8 p-4">
        <button
          appHoldable
          #hold="appHoldable"
          [holdTime]="800"
          (holdTimeEnd)="onSend()"
          class="rounded bg-indigo-600 px-4 py-2 font-bold text-white transition-colors ease-in-out hover:bg-indigo-700">
          Hold me
        </button>

        <progress [value]="hold.progress()" [max]="100"></progress>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  onSend() {
    console.log('Save it!');
  }
}
