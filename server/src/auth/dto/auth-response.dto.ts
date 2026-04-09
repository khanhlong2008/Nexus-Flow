import { UserRole } from '@prisma/client';
import { MenuItem } from '../../users/menu.config';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    branchId: string | null;
    branchName: string | null;
    menu: MenuItem[];
  };
}
