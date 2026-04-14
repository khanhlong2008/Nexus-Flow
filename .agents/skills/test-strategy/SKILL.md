---
name: test-strategy
description: Chiến lược test/thẩm định thay đổi cho Nexus Flow (server jest/e2e, web smoke checks).
origin: nexus-flow
---

# Test Strategy (Nexus Flow)

Activate khi bạn muốn mình thêm test hoặc chọn lệnh test phù hợp trước khi kết luận "xong".

## Server (NestJS)

- Unit/integration (Jest): `npm test` (trong `server/`).
- E2E (Supertest): `npm run test:e2e` (trong `server/`).

Khi thêm endpoint/service:

- Ưu tiên test service logic (RBAC/scoping, state machine transitions, self-approve guard).
- Với flow quan trọng, thêm e2e cho route chính (happy path + 1-2 case lỗi).

## Web (React + Vite)

Repo hiện tại chưa thấy test runner trong `web/package.json`, nên mặc định:

- Smoke check: `npm run lint` và `npm run build` (trong `web/`).
- Manual sanity: login/logout, 401 redirect `/login`, loading/empty/error states trên page vừa đổi.

## Minimal verification checklist

- Build passes (web + server).
- API gọi đúng URL, đúng payload, handle 401.
- RBAC: role sai bị 403; scoping theo branch đúng.
- AuditLog được ghi cho mutation quan trọng.

