import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges: () => boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  return component.hasUnsavedChanges()
    ? window.confirm('Вы потеряете изменения, если покинете страницу. Уйти со страницы?')
    : true;
};
