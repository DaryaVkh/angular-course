import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Role } from './user.model';
import { UserStore } from './user.store';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly user = toSignal(inject(UserStore).user$);

  readonly hasRole = input.required<Role | Role[]>();

  constructor() {
    effect(() => {
      const user = this.user();
      const role = this.hasRole();
      const roles = Array.isArray(role) ? role : [role];
      const visible =
        !!user &&
        (user.isAdmin || roles.some((r) => user.roles.includes(r)));

      this.viewContainer.clear();
      if (visible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
