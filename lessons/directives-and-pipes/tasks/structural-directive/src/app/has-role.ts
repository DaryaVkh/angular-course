import {
  computed,
  Directive,
  inject,
  input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Role } from './user.model';
import { UserStore } from './user.store';

@Directive({
  selector: '[hasRole]',
})
export class HasRole implements OnInit {
  private readonly template = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly userStore = inject(UserStore);

  readonly rolesInput = input.required<Role | Role[]>({ alias: 'hasRole' });
  readonly roles = computed<Role[]>(() => {
    const ri = this.rolesInput();
    return Array.isArray(ri) ? ri : [ri];
  });

  ngOnInit(): void {
    const user = this.userStore.user$;

    user.subscribe((user) => {
      this.viewContainerRef.clear();

      if (
        user?.isAdmin ||
        this.roles().length === 0 ||
        this.roles().some((role) => user?.roles.includes(role))
      ) {
        this.viewContainerRef.createEmbeddedView(this.template);
      }
    });
  }
}
