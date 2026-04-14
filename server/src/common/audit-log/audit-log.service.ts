import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogContext {
  userId: string;
  action: AuditAction;
  module: string;
  entityId?: string;
  entityType?: string;
  requestId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(ctx: AuditLogContext): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: ctx.userId,
        action: ctx.action,
        module: ctx.module,
        entityId: ctx.entityId,
        entityType: ctx.entityType,
        requestId: ctx.requestId,
        oldValues: (ctx.oldValues as Prisma.InputJsonValue) ?? undefined,
        newValues: (ctx.newValues as Prisma.InputJsonValue) ?? undefined,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
    });
  }
}
