import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { buildMenuForRole } from '../users/menu.config';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  branchId: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    // 1. Tìm user theo email, bao gồm thông tin branch
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id:       true,
        email:    true,
        name:     true,
        password: true,
        role:     true,
        isActive: true,
        branchId: true,
        branch:   { select: { name: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
    }

    // 2. So sánh password với bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // 3. Ghi audit log LOGIN
    await this.auditLogService.log({
      userId:    user.id,
      action:    'LOGIN',
      module:    'AUTH',
      entityId:  user.id,
      entityType: 'User',
      ipAddress,
      userAgent,
    });

    // 4. Tạo JWT payload và ký token
    const payload: JwtPayload = {
      sub:      user.id,
      email:    user.email,
      role:     user.role,
      branchId: user.branchId,
    };

    const accessToken = this.jwtService.sign(payload);

    // 5. Build menu theo role và trả về response (không bao giờ lộ password)
    return {
      accessToken,
      user: {
        id:         user.id,
        email:      user.email,
        name:       user.name,
        role:       user.role,
        branchId:   user.branchId,
        branchName: user.branch?.name ?? null,
        menu:       buildMenuForRole(user.role),
      },
    };
  }
}
