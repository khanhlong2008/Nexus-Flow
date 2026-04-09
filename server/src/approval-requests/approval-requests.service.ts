import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalRequest, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { ApprovalRequestResponseDto } from './dto/approval-request-response.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

@Injectable()
export class ApprovalRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // CREATE — Agent.md §3 State Machine: khởi tạo ở DRAFT
  // ─────────────────────────────────────────────────────────

  /**
   * Chỉ STAFF và BRANCH_LEAD được phép tạo yêu cầu.
   * branchId bắt buộc lấy từ profile User — không nhận từ client (bảo mật Data Scoping).
   */
  async createRequest(
    creatorId: string,
    dto: CreateApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId, isActive: true },
      select: { role: true, branchId: true },
    });

    if (!creator) {
      throw new NotFoundException('User không tồn tại hoặc đã bị vô hiệu hóa');
    }
    if (creator.role === UserRole.DIRECTOR || creator.role === UserRole.ADMIN) {
      throw new ForbiddenException('Director và Admin không được phép tạo approval request');
    }
    if (!creator.branchId) {
      throw new ForbiddenException('User phải thuộc một chi nhánh để tạo yêu cầu');
    }

    const request = await this.prisma.approvalRequest.create({
      data: {
        title:       dto.title,
        description: dto.description,
        requestType: dto.requestType,
        payload:     dto.payload as Prisma.InputJsonValue ?? undefined,
        status:      'DRAFT',
        creatorId,
        branchId:    creator.branchId,
      },
    });

    // Audit log bắt buộc theo copilot-instructions.md §3
    await this.auditLog.log({
      userId:     creatorId,
      action:     'CREATE',
      module:     'APPROVAL_REQUEST',
      entityId:   request.id,
      entityType: 'ApprovalRequest',
      newValues: {
        title:       request.title,
        requestType: request.requestType,
        status:      request.status,
      },
    });

    return request;
  }

  // ─────────────────────────────────────────────────────────
  // CREATE (PENDING) — Gửi yêu cầu trực tiếp vào hàng chờ duyệt
  // ─────────────────────────────────────────────────────────

  /**
   * Tạo ApprovalRequest với trạng thái PENDING ngay từ đầu.
   * - branchId bắt buộc lấy từ profile User, không nhận từ client (Data Scoping).
   * - Chỉ STAFF và BRANCH_LEAD được phép tạo yêu cầu.
   * - Ghi AuditLog sau khi tạo thành công.
   */
  async createApprovalRequest(
    creatorId: string,
    dto: CreateApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId, isActive: true },
      select: { role: true, branchId: true },
    });

    if (!creator) {
      throw new NotFoundException('User không tồn tại hoặc đã bị vô hiệu hóa');
    }
    if (creator.role === UserRole.DIRECTOR || creator.role === UserRole.ADMIN) {
      throw new ForbiddenException('Director và Admin không được phép tạo approval request');
    }
    if (!creator.branchId) {
      throw new ForbiddenException('User phải thuộc một chi nhánh để tạo yêu cầu');
    }

    const request = await this.prisma.approvalRequest.create({
      data: {
        title:       dto.title,
        description: dto.description,
        requestType: dto.requestType,
        payload:     dto.payload as Prisma.InputJsonValue ?? undefined,
        status:      'PENDING',
        creatorId,
        branchId:    creator.branchId,
      },
    });

    await this.auditLog.log({
      userId:     creatorId,
      action:     'CREATE',
      module:     'APPROVAL_REQUEST',
      entityId:   request.id,
      entityType: 'ApprovalRequest',
      requestId:  request.id,
      newValues: {
        title:       request.title,
        requestType: request.requestType,
        status:      request.status,
        branchId:    request.branchId,
      },
    });

    return request;
  }

  // ─────────────────────────────────────────────────────────
  // INCOMING — Danh sách yêu cầu GỬI ĐẾN để duyệt (Agent.md §4)
  // ─────────────────────────────────────────────────────────

  /**
   * Data Scoping theo Role:
   * - STAFF       : không có quyền duyệt → trả về []
   * - BRANCH_LEAD : PENDING requests trong chính branchId của họ
   * - DIRECTOR    : IN_REVIEW requests toàn hệ thống (cấp 2)
   * - ADMIN       : tất cả requests không phải DRAFT (giám sát)
   */
  async getIncomingRequests(userId: string): Promise<ApprovalRequestResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: { role: true, branchId: true },
    });

    if (!user) throw new NotFoundException('User không tồn tại hoặc đã bị vô hiệu hóa');

    switch (user.role) {
      case UserRole.STAFF:
        return [];

      case UserRole.BRANCH_LEAD: {
        if (!user.branchId) return [];
        return this.prisma.approvalRequest.findMany({
          where: { branchId: user.branchId, status: 'PENDING' },
          include: {
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        }) as Promise<ApprovalRequestResponseDto[]>;
      }

      case UserRole.DIRECTOR:
        return this.prisma.approvalRequest.findMany({
          where: { status: 'IN_REVIEW' },
          include: {
            creator: { select: { id: true, name: true, email: true } },
            branch:  { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        }) as Promise<ApprovalRequestResponseDto[]>;

      case UserRole.ADMIN:
        return this.prisma.approvalRequest.findMany({
          where: { status: { notIn: ['DRAFT'] } },
          include: {
            creator: { select: { id: true, name: true, email: true } },
            branch:  { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }) as Promise<ApprovalRequestResponseDto[]>;

      default:
        return [];
    }
  }

  // ─────────────────────────────────────────────────────────
  // OUTGOING — Danh sách yêu cầu ĐÃ GỬI đi (Agent.md §4)
  // ─────────────────────────────────────────────────────────

  /**
   * Data Scoping theo Role:
   * - STAFF       : chỉ requests do chính mình tạo + branchId guard
   * - BRANCH_LEAD : chỉ requests do chính mình tạo
   * - DIRECTOR    : chỉ requests do chính mình tạo (không giới hạn branch)
   * - ADMIN       : tất cả requests trong hệ thống (giám sát toàn diện)
   */
  async getOutgoingRequests(userId: string): Promise<ApprovalRequestResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: { role: true, branchId: true },
    });

    if (!user) throw new NotFoundException('User không tồn tại hoặc đã bị vô hiệu hóa');

    switch (user.role) {
      case UserRole.STAFF:
        return this.prisma.approvalRequest.findMany({
          where: {
            creatorId: userId,
            // branchId guard phòng data leak nếu user bị chuyển branch
            branchId: user.branchId ?? undefined,
          },
          include: {
            currentApprover: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }) as Promise<ApprovalRequestResponseDto[]>;

      case UserRole.BRANCH_LEAD:
        return this.prisma.approvalRequest.findMany({
          where: { creatorId: userId },
          include: {
            currentApprover: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }) as Promise<ApprovalRequestResponseDto[]>;

      case UserRole.DIRECTOR:
        return this.prisma.approvalRequest.findMany({
          where: { creatorId: userId },
          include: {
            branch:          { select: { id: true, name: true } },
            currentApprover: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }) as Promise<ApprovalRequestResponseDto[]>;

      case UserRole.ADMIN:
        // Admin xem toàn bộ hệ thống — phục vụ mục đích giám sát & audit
        return this.prisma.approvalRequest.findMany({
          include: {
            creator: { select: { id: true, name: true, email: true } },
            branch:  { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }) as Promise<ApprovalRequestResponseDto[]>;

      default:
        return [];
    }
  }

  // ─────────────────────────────────────────────────────────
  // APPROVE — State Machine: PENDING → IN_REVIEW | IN_REVIEW → APPROVED
  // ─────────────────────────────────────────────────────────

  /**
   * Luồng phê duyệt 2 cấp (Agent.md §3):
   * - BRANCH_LEAD : PENDING → IN_REVIEW
   * - DIRECTOR    : IN_REVIEW → APPROVED
   * - Người tạo yêu cầu không được tự duyệt yêu cầu của mình
   */
  async approveRequest(
    approverId: string,
    requestId: string,
    dto: ApproveRequestDto,
  ): Promise<ApprovalRequest> {
    const [approver, request] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: approverId, isActive: true },
        select: { role: true, branchId: true },
      }),
      this.prisma.approvalRequest.findUnique({ where: { id: requestId } }),
    ]);

    if (!approver) throw new NotFoundException('Approver không tồn tại hoặc đã bị vô hiệu hóa');
    if (!request)  throw new NotFoundException('Approval request không tồn tại');

    // Người tạo không được tự duyệt (Agent.md §2)
    if (request.creatorId === approverId) {
      throw new ForbiddenException('Bạn không thể tự phê duyệt yêu cầu của chính mình');
    }

    // Xác định trạng thái chuyển tiếp theo role và trạng thái hiện tại
    let nextStatus: 'IN_REVIEW' | 'APPROVED';

    if (approver.role === UserRole.BRANCH_LEAD) {
      if (request.status !== 'PENDING') {
        throw new BadRequestException(`Chỉ có thể duyệt yêu cầu ở trạng thái PENDING (hiện tại: ${request.status})`);
      }
      // BRANCH_LEAD duyệt phải thuộc cùng chi nhánh
      if (approver.branchId !== request.branchId) {
        throw new ForbiddenException('BranchLead chỉ được duyệt yêu cầu thuộc chi nhánh của mình');
      }
      nextStatus = 'IN_REVIEW';
    } else if (approver.role === UserRole.DIRECTOR) {
      if (request.status !== 'IN_REVIEW') {
        throw new BadRequestException(`Chỉ có thể duyệt yêu cầu ở trạng thái IN_REVIEW (hiện tại: ${request.status})`);
      }
      nextStatus = 'APPROVED';
    } else {
      throw new ForbiddenException('Chỉ BRANCH_LEAD và DIRECTOR mới có quyền phê duyệt');
    }

    // Transaction: cập nhật trạng thái + ghi lịch sử duyệt
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.approvalRequest.update({
        where: { id: requestId },
        data: { status: nextStatus, currentApproverId: approverId },
      });

      await tx.approvalHistory.create({
        data: {
          requestId,
          approverId,
          action:  'APPROVE',
          comment: dto.comment ?? null,
        },
      });

      return updatedRequest;
    });

    // Audit log bắt buộc theo copilot-instructions.md §3
    await this.auditLog.log({
      userId:     approverId,
      action:     'APPROVE',
      module:     'APPROVAL_REQUEST',
      entityId:   requestId,
      entityType: 'ApprovalRequest',
      oldValues:  { status: request.status },
      newValues:  { status: nextStatus, currentApproverId: approverId },
    });

    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // REJECT — State Machine: PENDING | IN_REVIEW → REJECTED
  // ─────────────────────────────────────────────────────────

  /**
   * Từ chối yêu cầu — cả BRANCH_LEAD và DIRECTOR đều được phép,
   * tuỳ theo trạng thái hiện tại của request.
   */
  async rejectRequest(
    approverId: string,
    requestId: string,
    dto: RejectRequestDto,
  ): Promise<ApprovalRequest> {
    const [approver, request] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: approverId, isActive: true },
        select: { role: true, branchId: true },
      }),
      this.prisma.approvalRequest.findUnique({ where: { id: requestId } }),
    ]);

    if (!approver) throw new NotFoundException('Approver không tồn tại hoặc đã bị vô hiệu hóa');
    if (!request)  throw new NotFoundException('Approval request không tồn tại');

    if (request.creatorId === approverId) {
      throw new ForbiddenException('Bạn không thể từ chối yêu cầu của chính mình');
    }

    // Kiểm tra trạng thái hợp lệ để từ chối
    if (approver.role === UserRole.BRANCH_LEAD) {
      if (request.status !== 'PENDING') {
        throw new BadRequestException(`BranchLead chỉ có thể từ chối yêu cầu ở trạng thái PENDING (hiện tại: ${request.status})`);
      }
      if (approver.branchId !== request.branchId) {
        throw new ForbiddenException('BranchLead chỉ được từ chối yêu cầu thuộc chi nhánh của mình');
      }
    } else if (approver.role === UserRole.DIRECTOR) {
      if (request.status !== 'IN_REVIEW') {
        throw new BadRequestException(`Director chỉ có thể từ chối yêu cầu ở trạng thái IN_REVIEW (hiện tại: ${request.status})`);
      }
    } else {
      throw new ForbiddenException('Chỉ BRANCH_LEAD và DIRECTOR mới có quyền từ chối');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.approvalRequest.update({
        where: { id: requestId },
        data:  { status: 'REJECTED', currentApproverId: approverId },
      });

      await tx.approvalHistory.create({
        data: {
          requestId,
          approverId,
          action:  'REJECT',
          comment: dto.comment,
        },
      });

      return updatedRequest;
    });

    await this.auditLog.log({
      userId:     approverId,
      action:     'REJECT',
      module:     'APPROVAL_REQUEST',
      entityId:   requestId,
      entityType: 'ApprovalRequest',
      oldValues:  { status: request.status },
      newValues:  { status: 'REJECTED', currentApproverId: approverId },
    });

    return updated;
  }
}
