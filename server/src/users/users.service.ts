import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserWithMenuDto } from './dto/user-with-menu.dto';
import { buildMenuForRole } from './menu.config';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy thông tin User kèm danh sách Menu động dựa trên Role (Agent.md §2).
   * Password bị loại khỏi response ở tầng Prisma select — không bao giờ lộ ra ngoài.
   */
  async getUserWithMenu(userId: string): Promise<UserWithMenuDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id:       true,
        email:    true,
        name:     true,
        role:     true,
        branchId: true,
        branch:   { select: { name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} không tồn tại hoặc đã bị vô hiệu hóa`);
    }

    return {
      id:         user.id,
      email:      user.email,
      name:       user.name,
      role:       user.role,
      branchId:   user.branchId,
      branchName: user.branch?.name ?? null,
      menu:       buildMenuForRole(user.role),
    };
  }
}
