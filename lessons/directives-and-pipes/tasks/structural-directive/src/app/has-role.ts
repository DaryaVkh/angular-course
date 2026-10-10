import {Directive, effect, inject, input, TemplateRef, ViewContainerRef} from '@angular/core';
import {toSignal} from "@angular/core/rxjs-interop";
import {UserStore} from "./user.store";
import {Role} from "./user.model";

@Directive({
  selector: '[hasRole]'
})
export class HasRole {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly user = toSignal(inject(UserStore).user$);

  readonly hasRole = input.required<Role | Role[]>();

  constructor() {
    effect(() => {
      const user = this.user();
      const roles = ([] as Role[]).concat(this.hasRole());

      this.viewContainer.clear();
      if (user && (user.isAdmin || roles.some((role) => user.roles.includes(role)))) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }

}
