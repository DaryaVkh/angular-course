import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HasRole } from './has-role';
import { HasRoleSuperAdmin } from './has-role-super-admin';

@Component({
  selector: 'app-information',
  template: `
    <h2 class="mt-10 text-xl">Information Panel</h2>
    <!-- admin can see everything -->
    <div *hasRoleSuperAdmin="true">visible only for super admin</div>
    <div *hasRole="'MANAGER'">visible if manager</div>
    <div *hasRole="['MANAGER', 'READER']">visible if manager and/or reader</div>
    <div *hasRole="['MANAGER', 'WRITER']">visible if manager and/or writer</div>
    <div *hasRole="'CLIENT'">visible if client</div>
    <div *hasRole="[]">visible for everyone</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HasRole, HasRoleSuperAdmin],
})
export class InformationComponent {}
