---
name: api-contract-sync
description: Checklist đồng bộ contract FE/BE (DTOs, services, types, UI) khi đổi API trong Nexus Flow.
origin: nexus-flow
---

# API Contract Sync (Nexus Flow)

Activate khi thay đổi endpoint/DTO ở `server/` hoặc khi UI gọi API bị mismatch. Mục tiêu: đổi 1 chỗ, sync đủ chỗ, không để bug runtime.

## Server-side contract sources

- Controller routes: `server/src/<feature>/*.controller.ts`
- Request DTOs: `server/src/<feature>/dto/*`
- Response shape: response DTO interfaces/classes trong `server/src/<feature>/dto/*`
- Enum constraints: `@prisma/client` + Prisma enums trong `server/prisma/schema.prisma`

## Client-side contract sources

- Service calls: `web/src/services/*.service.ts`
- Types: `web/src/types/*` (ưu tiên tập trung về `types` khi dùng nhiều)
- Forms: `web/src/pages/*` hoặc `web/src/components/*` (Zod schema)
- Tables: `web/src/shared/components/DataTable.tsx` + columns ở page

## Sync checklist (do in order)

- Update server DTO + validation (request).
- Update server response shape (tránh breaking change nếu UI đang dùng).
- Update service call URL/method/payload trong `web/src/services/*`.
- Update TS types + Zod schema (nếu form).
- Update UI mapping (table columns, labels, empty/loading/error).
- Sanity check auth/RBAC: `@Roles(...)` đúng và UI hide/show đúng.

## Compatibility rules

- Không đổi semantics của field mà không đổi tên.
- Nếu phải breaking change, update đồng thời `server` + `web` trong cùng scope.

