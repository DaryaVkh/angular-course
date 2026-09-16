import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges: () => boolean;
}

/**
 * Требование:
 * - Если component.hasUnsavedChanges() вернул true — показать
 *   window.confirm('...') и вернуть его результат.
 * - Если изменений нет — разрешить переход без диалога.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  return true;
};
