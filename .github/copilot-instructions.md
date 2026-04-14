# Nexus Flow Delivery Instructions (3 Phases)

This document outlines a full front-end, back-end, and business workflow plan split into three phases. It follows the project constitution (RBAC, DTOs, Prisma-only access, audit logging, and validation).

## Phase 1 - Foundation and Access Control

### Business scope
- Define user roles: Director, BranchLead, Staff.
- Define data scoping rules:
  - Staff: only own data.
  - BranchLead: all data for their branch.
  - Director: global access.
- Establish authentication and session rules (login, logout, token refresh policy if any).
- Agree on menu visibility rules per role.

### Back-end tasks (NestJS)
- Auth module:
  - Login endpoint with DTOs and validation.
  - Issue JWT token with role and branch context.
- RBAC:
  - Implement `RolesGuard` for all protected endpoints.
  - Enforce role access for each controller.
- Data scoping:
  - Centralize scoping in service layer (no controller logic).
- User module:
  - Provide list and read endpoints scoped by role.
- Audit logging:
  - Implement `AuditLogService` and log all create/update/delete operations.
- Validation:
  - Use class-validator DTOs for request/response types.

### Front-end tasks (React + Vite)
- Auth flow:
  - Login page with form validation.
  - Store auth token and user profile in state.
  - Protected routes with redirect to login if unauthenticated.
- Dynamic sidebar:
  - Render from menu config and filter by role.
- Layout:
  - Main layout with sidebar, top bar, and content area.
- Loading states:
  - Add loading indicators for all async operations.

### Deliverables
- Working login and protected routes.
- Role-aware menu and access control on both front-end and back-end.
- Audit logs created for all data mutations.

## Phase 2 - Core Approval Workflow

### Business scope
- Approval request lifecycle: Draft -> Submitted -> Approved or Rejected.
- Define approval rules and who can approve based on role.
- Define required fields for each request type.

### Back-end tasks (NestJS)
- Approval requests module:
  - Create, list, approve, reject endpoints with DTOs.
  - Enforce role and data scoping in services.
- Request types module:
  - CRUD endpoints with validation and audit logging.
- Audit logging:
  - Log approve/reject actions with metadata.

### Front-end tasks (React + Vite)
- Create Request page:
  - Form with request type selection and required fields.
- My Requests page:
  - Table filtered by current user.
- Incoming Requests page:
  - Table for approval queue (BranchLead or Director).
  - Approve/reject actions with confirmations and loading states.

### Deliverables
- End-to-end approval flow working with RBAC and audit logs.
- Request types managed by authorized roles.

## Phase 3 - Reporting and Operations

### Business scope
- Define key metrics: approvals per day, pending count, turnaround time.
- Define export and audit review requirements.

### Back-end tasks (NestJS)
- Reporting endpoints:
  - Aggregated metrics scoped by role.
- Audit log review endpoints:
  - Filter by time range, action, and user.
- Performance:
  - Pagination and indexing for large tables.

### Front-end tasks (React + Vite)
- Dashboard page:
  - Summary cards and charts using reporting API.
- Audit log viewer:
  - Filters and pagination.
- Export:
  - CSV export for authorized roles.

### Deliverables
- Dashboard with role-aware metrics.
- Audit log review and export.
- Performance-optimized tables.

## Cross-cutting rules (all phases)
- Use DTOs for all API requests/responses.
- No raw SQL; use Prisma only.
- No business logic in controllers.
- Add loading states for all async actions.
- Do not hardcode sensitive configuration.

## Frontend Architecture Rules (Stable and Reusable)

### Folder design
- Shared and stable code must live under `web/src/shared`.
- Use this convention:
  - `shared/components`: highly reusable UI building blocks.
  - `shared/hooks`: reusable React hooks with no business-specific coupling.
  - `shared/utils`: pure helper functions (formatters, parsers, error handlers).
- Page-specific UI stays in `pages/*`; feature-specific components stay in `components/*`.

### Components
- Components should be presentational by default and receive data via props.
- Avoid embedding API calls directly inside reusable components.
- Keep className and visual contract stable so components can be reused without breaking styles.
- If a component is reused in 2+ places, move it to `shared/components`.

### Functions and utils
- Functions in `shared/utils` must be deterministic and side-effect free.
- Centralize repeated logic:
  - API error extraction (single parser function).
  - Date/time formatting.
  - Safe JSON parsing/validation.
- Avoid duplicate inline parsing/formatting logic in pages.

### Hooks
- Hooks in `shared/hooks` should encapsulate cross-page behavior:
  - async loading lifecycle (`isLoading`, execute wrapper).
  - auth/session read helpers.
  - other app-wide state access patterns.
- Hooks should expose minimal, stable contracts to reduce refactor cost.

### Consistency requirements
- Reuse existing shared primitives before creating new variants.
- New pages must use shared `PageHeader`, `StateCard`, and shared error parsing utils where applicable.
- Keep naming clear and predictable (`useXxx`, `formatXxx`, `parseXxx`).
