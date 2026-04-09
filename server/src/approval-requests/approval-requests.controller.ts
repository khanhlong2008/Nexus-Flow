import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApprovalRequestsService } from './approval-requests.service';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

/** Shape tối giản của request.user được inject bởi AuthGuard */
type AuthenticatedRequest = ExpressRequest & {
  user: { id: string; role: UserRole };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { DIRECTOR, BRANCH_LEAD, ADMIN } = UserRole;

/**
 * ApprovalRequestsController
 *
 * Phân quyền theo copilot-instructions.md §3 (RBAC):
 * - POST   /approval-requests           → STAFF, BRANCH_LEAD (tạo yêu cầu)
 * - GET    /approval-requests/incoming  → BRANCH_LEAD, DIRECTOR, ADMIN
 * - GET    /approval-requests/outgoing  → tất cả roles đã xác thực
 * - PATCH  /approval-requests/:id/approve → BRANCH_LEAD, DIRECTOR (Roles Guard)
 * - PATCH  /approval-requests/:id/reject  → BRANCH_LEAD, DIRECTOR (Roles Guard)
 */
@Controller('approval-requests')
@UseGuards(RolesGuard)
export class ApprovalRequestsController {
  constructor(private readonly service: ApprovalRequestsService) {}

  // ─── CREATE ────────────────────────────────────────────────

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateApprovalRequestDto,
  ) {
    return this.service.createApprovalRequest(req.user.id, dto);
  }

  // ─── READ ──────────────────────────────────────────────────

  /** Danh sách yêu cầu gửi đến cần duyệt (inbox) */
  @Get('incoming')
  @Roles(BRANCH_LEAD, DIRECTOR, ADMIN)
  getIncoming(@Req() req: AuthenticatedRequest) {
    return this.service.getIncomingRequests(req.user.id);
  }

  /** Danh sách yêu cầu đã gửi đi (outbox) */
  @Get('outgoing')
  getOutgoing(@Req() req: AuthenticatedRequest) {
    return this.service.getOutgoingRequests(req.user.id);
  }

  // ─── APPROVE / REJECT ──────────────────────────────────────

  /**
   * Phê duyệt yêu cầu.
   * Chỉ DIRECTOR và BRANCH_LEAD mới có quyền gọi endpoint này.
   */
  @Patch(':id/approve')
  @Roles(DIRECTOR, BRANCH_LEAD)
  approve(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
    @Body() dto: ApproveRequestDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.service.approveRequest(req.user.id, requestId, dto);
  }

  /**
   * Từ chối yêu cầu.
   * Chỉ DIRECTOR và BRANCH_LEAD mới có quyền gọi endpoint này.
   */
  @Patch(':id/reject')
  @Roles(DIRECTOR, BRANCH_LEAD)
  reject(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
    @Body() dto: RejectRequestDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.service.rejectRequest(req.user.id, requestId, dto);
  }
}
