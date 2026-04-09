export type UserRole = 'ADMIN' | 'DIRECTOR' | 'BRANCH_LEAD' | 'STAFF';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export interface UserWithMenuDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
  menu: MenuItem[];
}
