import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
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
      const roles = this.hasRole();
      const user = this.user();

      this.viewContainer.clear();

      const hasRole =
        user &&
        (Array.isArray(roles) ? roles : [roles]).some((role) =>
          user.roles.includes(role),
        );

      if (hasRole) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
