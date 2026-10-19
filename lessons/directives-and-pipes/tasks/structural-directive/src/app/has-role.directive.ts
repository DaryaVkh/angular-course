import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Role } from './user.model';
import { UserStore } from './user.store';

@Directive({ selector: '[hasRole]' })
export class HasRoleDirective {
  private readonly user = toSignal(inject(UserStore).user$);
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  readonly hasRole = input.required<Role | Role[]>();

  private readonly allowed = computed(() => {
    const user = this.user();
    if (!user) return false;
    if (user.isAdmin) return true;

    const roles = this.hasRole();
    const required = Array.isArray(roles) ? roles : [roles];
    return required.some((role) => user.roles.includes(role));
  });

  constructor() {
    effect(() => {
      this.container.clear();
      if (this.allowed()) {
        this.container.createEmbeddedView(this.template);
      }
    });
  }
}

@Directive({ selector: '[hasRoleSuperAdmin]' })
export class HasRoleSuperAdminDirective {
  private readonly user = toSignal(inject(UserStore).user$);
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  readonly hasRoleSuperAdmin = input.required<boolean>();

  private readonly allowed = computed(
    () => this.hasRoleSuperAdmin() && !!this.user()?.isAdmin,
  );

  constructor() {
    effect(() => {
      this.container.clear();
      if (this.allowed()) {
        this.container.createEmbeddedView(this.template);
      }
    });
  }
}
