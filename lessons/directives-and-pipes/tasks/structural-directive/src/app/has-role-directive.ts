import {
  computed,
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

@Directive({ selector: '[hasRole], [hasRoleSuperAdmin]' })
export class HasRoleDirective {
  private readonly user = toSignal(inject(UserStore).user$);
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly hasRole = input<Role | Role[]>([]);
  readonly hasRoleSuperAdmin = input<boolean>();

  private readonly requiredRoles = computed<Role[]>(() => {
    const role = this.hasRole();
    return Array.isArray(role) ? role : [role];
  });

  private readonly allowed = computed(() => {
    const user = this.user();
    if (!user)
      return false;

    const superAdmin = this.hasRoleSuperAdmin();
    return superAdmin !== undefined
      ? user.isAdmin === superAdmin
      : user.isAdmin || this.hasRequiredRole(user.roles);
  });

  private hasRequiredRole(userRoles: Role[]): boolean {
    return this.requiredRoles().some((role) => userRoles.includes(role));
  }

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();
      if (this.allowed()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
