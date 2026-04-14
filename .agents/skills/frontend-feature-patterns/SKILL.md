---
name: frontend-feature-patterns
description: Chuẩn làm feature UI trong web/ (router, services, forms, zustand, DataTable, loading/errors) theo Nexus Flow.
origin: nexus-flow
---

# Frontend Feature Patterns (Nexus Flow)

Activate khi tạo page/feature trong `web/` để mình bám đúng kiến trúc `shared/*`, cách gọi API, form validation và UI states.

## Folder rules (stable)

Theo `.github/copilot-instructions.md`:

- Shared stable code: `web/src/shared/*`
- API calls: `web/src/services/*` dùng `web/src/lib/api-client.ts`
- Feature/page UI: `web/src/pages/*` và `web/src/components/*`

## API calling conventions

- Dùng `apiClient` từ `web/src/lib/api-client.ts`
  - Auto attach `Authorization: Bearer <token>` từ `localStorage`.
  - Auto xử lý 401: clear token + redirect `/login`.
- Mỗi domain 1 service file (vd `web/src/services/approval-requests.service.ts`).
- Trả về `response.data` và để page/component xử lý loading/errors.

## Forms

- Dùng `react-hook-form` + `zod` + `@hookform/resolvers/zod`.
- Validation phía client giúp UX, nhưng server vẫn là source of truth.

## Tables

- Prefer tái dùng `web/src/shared/components/DataTable.tsx`.
- Columns define bởi `DataTableColumn<T>[]` + `rowKey`.
- Không nhét fetch trong `DataTable`; fetch nằm ở page.

## UI states

- Mọi async phải có:
  - loading state (skeleton hoặc `StateCard`).
  - empty state.
  - error state (hiển thị message rõ ràng, không swallow).

## Auth + RBAC on UI

- Sidebar/menu phải filter theo `role` và `branchType`.
- Mục "Phân quyền & Cấu hình" chỉ show khi `role === ADMIN`.

