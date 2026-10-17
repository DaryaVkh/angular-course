import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserStore } from '../../user.store';
import { Role } from '../../user.model';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private readonly user = toSignal(inject(UserStore).user$);

  readonly hasRole = input.required<Role | Role[]>();

  constructor() {
    effect(() => {
      const user = this.user();
      const value = this.hasRole();
      const roles = Array.isArray(value) ? value : [value];

      const visible =
        !!user &&
        (user.isAdmin ||
          roles.some((role) => user.roles.includes(role)));

      this.viewContainer.clear();

      if (visible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
