import {
  Directive,
  inject,
  input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserStore } from './user.store';

@Directive({
  selector: '[hasRoleSuperAdmin]',
})
export class HasRoleSuperAdmin implements OnInit {
  private readonly template = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly userStore = inject(UserStore);

  readonly requiredIsAdminValue = input.required({
    alias: 'hasRoleSuperAdmin',
  });

  ngOnInit(): void {
    this.userStore.user$.subscribe((user) => {
      this.viewContainerRef.clear();
      if (user && user.isAdmin === this.requiredIsAdminValue()) {
        this.viewContainerRef.createEmbeddedView(this.template);
      }
    });
  }
}
