import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateRequestTypeDto } from './dto/update-request-type.dto';

@Injectable()
export class RequestTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveTypes() {
    return this.prisma.requestType.findMany({
      where: { isActive: true },
      orderBy: [{ name: 'asc' }],
    });
  }

  async getAllTypes() {
    return this.prisma.requestType.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  async createType(dto: CreateRequestTypeDto) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.requestType.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Loại yêu cầu ${code} đã tồn tại`);
    }

    return this.prisma.requestType.create({
      data: {
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateType(id: string, dto: UpdateRequestTypeDto) {
    const existing = await this.prisma.requestType.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy loại yêu cầu');
    }

    return this.prisma.requestType.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        isActive: dto.isActive,
      },
    });
  }
}
