import {
  Directive,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { User, Role } from './user.model';
import { UserStore } from './user.store';

type RoleInput = Role | Role[] | string;

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnDestroy {
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly userStore = inject(UserStore);

  private roles: Role[] = [];
  private currentUser: User | undefined;

  private readonly subscription = this.userStore.user$.subscribe((user) => {
    this.currentUser = user;
    this.updateView();
  });

  @Input('hasRole')
  set hasRole(value: RoleInput) {
    this.roles = this.normalizeRoles(value);
    this.updateView();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private normalizeRoles(value: RoleInput): Role[] {
    if (Array.isArray(value)) {
      return value as Role[];
    }

    if (typeof value === 'string') {
      const roles = value
        .split(',')
        .map((role) => role.trim())
        .filter(Boolean);

      return roles as Role[];
    }

    return value ? [value] : [];
  }

  private updateView(): void {
    const shouldShow = Boolean(
      this.currentUser &&
        this.roles.length > 0 &&
        this.roles.some((role) => this.currentUser?.roles.includes(role)),
    );

    if (shouldShow) {
      if (this.viewContainerRef.length === 0) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
      return;
    }

    this.viewContainerRef.clear();
  }
}

@Directive({
  selector: '[hasRoleSuperAdmin]',
  standalone: true,
})
export class HasRoleSuperAdminDirective implements OnDestroy {
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly userStore = inject(UserStore);

  private enabled = false;
  private currentUser: User | undefined;

  private readonly subscription = this.userStore.user$.subscribe((user) => {
    this.currentUser = user;
    this.updateView();
  });

  @Input('hasRoleSuperAdmin')
  set hasRoleSuperAdmin(value: boolean | string) {
    this.enabled = value === true || value === '' || value === 'true';
    this.updateView();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateView(): void {
    const shouldShow = Boolean(this.enabled && this.currentUser?.isAdmin);

    if (shouldShow) {
      if (this.viewContainerRef.length === 0) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
      return;
    }

    this.viewContainerRef.clear();
  }
}
