import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard kiểm tra Role của User hiện tại dựa trên metadata từ @Roles() decorator.
 * Yêu cầu: request.user phải được inject bởi AuthGuard trước đó (JWT / Session).
 *
 * Flow:
 *  1. Handler/Controller không dùng @Roles()  → cho phép (không phân quyền).
 *  2. request.user không tồn tại              → 401 Unauthorized.
 *  3. user.role nằm trong danh sách @Roles()  → cho phép.
 *  4. Ngược lại                               → 403 Forbidden.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Đọc metadata roles từ handler trước, fallback lên class nếu không có
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()] as const,
    );

    // Nếu không có @Roles() nào → bỏ qua kiểm tra
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role: UserRole } }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Chức năng này yêu cầu quyền: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
