import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserStore } from './user.store';

@Directive({
  selector: '[hasRoleSuperAdmin]',
})
export class HasRoleSuperAdminDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly user = toSignal(inject(UserStore).user$);

  readonly hasRoleSuperAdmin = input.required<boolean>();

  constructor() {
    effect(() => {
      const visible = this.hasRoleSuperAdmin() && !!this.user()?.isAdmin;

      this.viewContainer.clear();
      if (visible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
