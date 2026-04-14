---
name: review-checklist
description: Checklist review theo chuẩn Nexus Flow (correctness, RBAC, scoping, DTO, audit, UX states).
origin: nexus-flow
---

# Review Checklist (Nexus Flow)

Activate khi bạn nói "review giúp" hoặc khi mình chuẩn bị merge-ready.

## Correctness

- State machine transitions đúng (`DRAFT/PENDING/IN_REVIEW/APPROVED/REJECTED`).
- Chặn self-approve/self-reject.
- Không nhận field nhạy cảm từ client (vd `branchId`).

## Security / RBAC / scoping

- Endpoint protected có `@UseGuards(RolesGuard)` và `@Roles(...)` đúng.
- BranchLead chỉ thao tác trong branch của mình; Staff chỉ own data; Director/Admin global.
- 401/403 trả về đúng (không leak thông tin).

## DTO + validation

- Request DTO có validation đầy đủ.
- Response shape ổn định, không trả thừa dữ liệu nhạy cảm.

## Data / Prisma

- Query dùng `select/include` hợp lý, tránh trả payload quá lớn.
- Index phù hợp cho filter chính.

## Audit

- Mutation có `AuditLogService.log` với `oldValues/newValues` hợp lý.
- Lịch sử duyệt (ApprovalHistory) immutable.

## Frontend UX

- Có loading/empty/error states.
- Không nhét API call vào reusable shared component.
- Menu/sidebar filter theo role đúng (ADMIN-only config menu).

