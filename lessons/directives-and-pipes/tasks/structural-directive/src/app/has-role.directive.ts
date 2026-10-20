import {
  computed,
  Directive,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Role, User } from './user.model';
import { UserStore } from './user.store';

@Directive({
  selector: '[hasRole], [hasRoleSuperAdmin]',
})
export class HasRoleDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly userStore = inject(UserStore);

  readonly roles = input<Role | Role[]>([], { alias: 'hasRole' });
  readonly superAdmin = input(false, { alias: 'hasRoleSuperAdmin' });

  private readonly user = signal<User | undefined>(undefined);
  private readonly subscription = this.userStore.user$.subscribe((user) =>
    this.user.set(user),
  );

  private readonly isVisible = computed(() => {
    const user = this.user();
    if (!user) {
      return false;
    }
    if (user.isAdmin) {
      return true;
    }
    if (this.superAdmin()) {
      return false;
    }
    const roles = this.roles();
    return (Array.isArray(roles) ? roles : [roles]).some((role) =>
      user.roles.includes(role),
    );
  });

  constructor() {
    effect(() => {
      this.viewContainer.clear();
      if (this.isVisible()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
