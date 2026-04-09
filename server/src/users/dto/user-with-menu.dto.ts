import { UserRole } from '@prisma/client';
import { MenuItem } from '../menu.config';

export class UserWithMenuDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
  menu: MenuItem[];
}
