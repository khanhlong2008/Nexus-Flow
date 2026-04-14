---
name: prisma-data-patterns
description: Quy ước Prisma schema/query/migration/seed cho Nexus Flow (Postgres, cuid IDs, audit, indexes, Json payload).
origin: nexus-flow
---

# Prisma Data Patterns (Nexus Flow)

Activate khi sửa `server/prisma/schema.prisma`, thêm migration, viết seed, hoặc tối ưu query Prisma.

## Schema conventions (repo hiện tại)

- ID: `String @id @default(cuid())`
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Table mapping: `@@map("snake_case")`
- Index: thêm `@@index([...])` cho các cột filter/sort chính.

## Enums và workflow

- Dùng enums trong schema để enforce state machine:
  - `ApprovalStatus`: `DRAFT|PENDING|IN_REVIEW|APPROVED|REJECTED`
  - `ApprovalAction`: `SUBMIT|APPROVE|REJECT|REQUEST_CHANGE|RESUBMIT`
  - `AuditAction`: `CREATE|UPDATE|DELETE|APPROVE|REJECT|LOGIN|LOGOUT`

## Json payload

- `payload Json?` cho dữ liệu linh hoạt theo `requestType`.
- Khi ghi Json từ DTO/service, cast sang `Prisma.InputJsonValue`.
- Tránh lưu dữ liệu nhạy cảm trong `payload` nếu không cần.

## Query patterns

- `select` tối thiểu fields cần dùng (đặc biệt cho list).
- `include` chỉ khi UI cần relation; prefer `select` nested để giới hạn payload.
- Dùng `findFirst` khi cần thêm điều kiện `isActive` + `id`.

## Migration + seed

- Migration: thay đổi nhỏ, rõ ràng; hạn chế sửa tay trong `migrations/*`.
- Seed: idempotent nếu có thể (check `code`/`email` unique trước khi create).

## Soft rules về audit

- Mọi mutation nghiệp vụ quan trọng cần có audit record trong DB (dùng `AuditLogService` ở service layer).
- `ApprovalHistory` là immutable: không update/delete record lịch sử.

