import { HasRoleSuperAdmin } from './has-role-super-admin';

describe('HasRoleSuperAdmin', () => {
  it('should create an instance', () => {
    const directive = new HasRoleSuperAdmin();
    expect(directive).toBeTruthy();
  });
});
