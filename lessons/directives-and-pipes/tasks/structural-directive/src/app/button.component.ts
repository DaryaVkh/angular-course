/* eslint-disable @angular-eslint/component-selector */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'button[app-button]',
  template: `
    <ng-content />
  `,
  host: {
    class: 'border border-blue-700 bg-blue-400 p-2 rounded-sm text-white disabled:opacity-50 disabled:cursor-not-allowed',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {}
