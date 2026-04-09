# Nexus Flow Project Constitution

## 1. Tech Stack Standards
- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL.
- **Communication**: RESTful API, JSON format.

## 2. Architectural Rules (Mandatory)
- **Clean Architecture**: Tách biệt logic nghiệp vụ (Services) khỏi Controller. Không viết logic xử lý dữ liệu trực tiếp trong Controller.
- **Type Safety**: Tất cả các hàm và biến phải có kiểu dữ liệu rõ ràng. Sử dụng DTOs cho mọi Request/Response.
- **Naming Convention**: 
  - Frontend: Component đặt tên PascalCase, Function/Variable đặt tên camelCase.
  - Backend: Class đặt tên PascalCase, Method đặt tên camelCase.
- **Database**: Luôn sử dụng Prisma Client để truy vấn. Không viết SQL thuần trừ trường hợp bất khả kháng.

## 3. Authorization & Security Rules
- **RBAC (Role-Based Access Control)**: Kiểm tra quyền truy cập dựa trên `UserRole` (Director, BranchLead, Staff) cho mọi Endpoint.
- **Data Scoping**:
  - `Staff`: Chỉ thấy dữ liệu của chính mình.
  - `BranchLead`: Thấy dữ liệu của toàn bộ chi nhánh mình quản lý (`branchId`).
  - `Director`: Thấy dữ liệu toàn cầu (Trụ sở chính).
- **Audit Logging**: Mọi hành động Create/Update/Delete và Phê duyệt phải được ghi lại thông qua `AuditLogService`.

## 4. UI/UX Rules
- **Dynamic Sidebar**: Sidebar phải được render từ file cấu hình menu, ẩn/hiện dựa trên quyền của User.
- **Loading States**: Tất cả các hành động bất đồng bộ phải có trạng thái Loading.
- **Validation**: Sử dụng Zod hoặc Class-Validator để validate dữ liệu từ cả hai phía.

## 5. Coding Principles
- Ưu tiên hiệu năng (Performance Optimization).
- Code phải dễ đọc, dễ bảo trì (S.O.L.I.D principles).
- Không bao giờ được Hardcode các giá trị quan trọng (URL, Secret Key).