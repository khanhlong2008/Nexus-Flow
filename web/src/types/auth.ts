import type { MenuItem, UserRole } from './menu';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
  menu: MenuItem[];
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
