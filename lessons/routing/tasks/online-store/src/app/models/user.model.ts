export type UserRole = 'user' | 'admin';

export interface AppUser {
  readonly username: string;
  readonly role: UserRole;
}
