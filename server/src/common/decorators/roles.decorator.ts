import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator để khai báo quyền truy cập theo Role.
 * Áp dụng trên Handler (method) hoặc Class (controller).
 *
 * @example
 * @Roles(UserRole.DIRECTOR, UserRole.BRANCH_LEAD)
 * approveRequest() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
