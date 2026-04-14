---
name: backend-nest-crud
description: Chuẩn tạo CRUD/endpoint cho NestJS + Prisma trong Nexus Flow (DTOs, RBAC, scoping, audit, errors).
origin: nexus-flow
---

# Backend NestJS CRUD (Nexus Flow)

Activate khi thêm module/endpoint/CRUD ở `server/` để mình làm đúng chuẩn: DTO validation, RBAC, data scoping, transaction, audit log.

## Golden rules

- Không business logic trong controller.
- Không raw SQL; chỉ dùng Prisma qua `PrismaService`.
- Mọi mutation phải gọi `AuditLogService.log(...)`.
- Endpoint protected phải có `@UseGuards(RolesGuard)` + `@Roles(...)` phù hợp.

## Skeleton chuẩn cho 1 feature

- `server/src/<feature>/<feature>.module.ts`
- `server/src/<feature>/<feature>.controller.ts`
- `server/src/<feature>/<feature>.service.ts`
- `server/src/<feature>/dto/*.dto.ts`

## DTO conventions (repo hiện tại)

- Request DTO: class + `class-validator` (vd `IsString`, `IsOptional`, `MaxLength`, ...).
- Response DTO: repo đang dùng dạng `interface` (vd `server/src/approval-requests/dto/approval-request-response.dto.ts`).
- Enum: import từ `@prisma/client` (vd `UserRole`).

## Patterns cần nhớ (Nexus Flow)

- Data scoping:
  - Không nhận `branchId`/`creatorId` từ client nếu có thể suy ra từ `request.user`.
  - BranchLead chỉ thao tác dữ liệu chi nhánh của mình; Staff chỉ thao tác dữ liệu của mình; Director/Admin global.
- Workflow:
  - Bám state machine `DRAFT/PENDING/IN_REVIEW/APPROVED/REJECTED`.
  - Chặn self-approve: `if (request.creatorId === approverId) throw ForbiddenException`.
- Transactions:
  - Khi mutation có nhiều bước (update + history) dùng `prisma.$transaction(...)`.

## Audit log checklist

Gọi `AuditLogService.log()` ngay sau khi mutation thành công:

- `action`: `CREATE|UPDATE|DELETE|APPROVE|REJECT|LOGIN|LOGOUT`
- `module`: string ổn định (vd `APPROVAL_REQUEST`)
- `entityId`, `entityType`
- `oldValues`/`newValues`: chỉ snapshot fields quan trọng (tránh nhét cả payload lớn)

## Error handling convention

- `NotFoundException`: entity không tồn tại hoặc bị vô hiệu hóa.
- `ForbiddenException`: sai quyền, sai scoping, self-approve.
- `BadRequestException`: sai trạng thái workflow, input hợp lệ nhưng nghiệp vụ không cho phép.

