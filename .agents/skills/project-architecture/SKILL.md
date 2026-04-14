---
name: project-architecture
description: Repo-specific architecture + conventions for Nexus Flow (web + server), bám Agent.md và copilot-instructions.
origin: nexus-flow
---

# Project Architecture (Nexus Flow)

Dùng skill này khi bạn muốn mình tạo/sửa code mà không phải nhắc lại: đặt file ở đâu, chia layer thế nào, quy tắc RBAC, workflow duyệt, và các ràng buộc "không được làm".

## Repo layout (high level)

- `web/`: React 19 + Vite + Tailwind v4, `react-router-dom`, `zustand`, `react-hook-form` + `zod`, `axios`.
- `server/`: NestJS 11 + Prisma (PostgreSQL), `class-validator`, `class-transformer`, Jest + Supertest.

## Business constitution (must-follow)

Từ `.agents/Agent.md`:

- Roles: `DIRECTOR`, `BRANCH_LEAD`, `STAFF` (+ `ADMIN` cho cấu hình).
- Approval state machine: `DRAFT -> PENDING -> IN_REVIEW -> APPROVED | REJECTED`.
- Constraint: user không được phê duyệt request do chính mình tạo.

Từ `.github/copilot-instructions.md`:

- Dùng DTO cho mọi API request/response.
- Không raw SQL, chỉ Prisma.
- Không business logic trong controller (đặt ở service).
- Mọi mutation phải ghi `AuditLog`.
- Frontend phải có loading states cho async.

## Frontend architecture rules

Theo `.github/copilot-instructions.md`:

- Shared stable code: `web/src/shared/*`
- `web/src/shared/components`: UI primitives tái dùng.
- `web/src/shared/hooks`: hooks dùng chung (không dính business).
- `web/src/shared/utils`: pure helpers, deterministic.
- Page-specific: `web/src/pages/*`; feature-specific components: `web/src/components/*`.
- API calls ở `web/src/services/*` và dùng `web/src/lib/api-client.ts`.
- Không nhét API call vào reusable shared component.

## Backend architecture rules

- Mỗi feature một module: `server/src/<feature>/*`.
- RBAC dùng `@UseGuards(RolesGuard)` + `@Roles(...)`.
- Prisma truy cập qua `PrismaService` (`server/src/common/prisma/prisma.service.ts`).
- Audit dùng `AuditLogService` (`server/src/common/audit-log/audit-log.service.ts`).

## Definition of done (tối thiểu)

- Không phá RBAC/scoping theo role/branch.
- Controller mỏng, service chịu trách nhiệm nghiệp vụ.
- DTO validation đầy đủ (request) + trả response shape ổn định.
- Có audit log cho create/update/delete/approve/reject/login/logout.
- UI có loading + error handling rõ ràng.

