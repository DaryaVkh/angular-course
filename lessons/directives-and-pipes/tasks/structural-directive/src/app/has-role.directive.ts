import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Role, User } from './user.model';
import { UserStore } from './user.store';
import { toSignal } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[hasRole], [hasRoleSuperAdmin]',
})
export class HasRoleDirective {
  readonly hasRole = input<Role | Role[]>([]);
  readonly hasRoleSuperAdmin = input(false);
  private readonly userStore = inject(UserStore);
  private readonly user = toSignal(this.userStore.user$);
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => this.updateView());
  }

  private updateView(): void {
    const user = this.user();
    this.viewContainer.clear();
    if (!user) {
      return;
    }

    if (this.canShowContent(user)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private canShowContent(user: User): boolean {
    const required = this.hasRole();
    const requiredRoles = Array.isArray(required) ? required : [required];

    return this.hasRoleSuperAdmin() ? user.isAdmin : user.isAdmin
      || requiredRoles.some(r => user.roles.includes(r));
  }
}
