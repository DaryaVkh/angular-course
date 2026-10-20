import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HasRoleDirective } from './has-role.directive';
import { HasRoleSuperAdminDirective } from './has-role-super-admin.directive';

@Component({
  selector: 'app-information',
  imports: [HasRoleDirective, HasRoleSuperAdminDirective],
  template: `
    <h2 class="mt-10 text-xl">Information Panel</h2>
    <!-- admin can see everything -->
    <div *hasRoleSuperAdmin="true">visible only for super admin</div>
    <div *hasRole="'MANAGER'">visible if manager</div>
    <div *hasRole="['MANAGER', 'READER']">visible if manager and/or reader</div>
    <div *hasRole="['MANAGER', 'WRITER']">visible if manager and/or writer</div>
    <div *hasRole="'CLIENT'">visible if client</div>
    <div>visible for everyone</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationComponent {}
