# Business Intelligence: Nexus Flow Approval System

## 1. User Categorization
- **Director (Trụ sở chính)**: 
  - Quyền cao nhất.
  - Phê duyệt các yêu cầu từ chi nhánh gửi lên.
  - Xem báo cáo tổng hợp toàn hệ thống.
  - Xem Audit Log toàn dự án.
- **Branch Lead (Trưởng chi nhánh)**: 
  - Quản lý nhân viên trong chi nhánh.
  - Phê duyệt yêu cầu cấp 1 của nhân viên.
  - Gửi yêu cầu lên Trụ sở chính nếu cần cấp cao hơn duyệt.
- **Staff (Nhân viên)**: 
  - Tạo yêu cầu (Tickets).
  - Chỉnh sửa yêu cầu nếu bị trả lại (Rejected/Request Change).

## 2. Dynamic Menu Logic
- Hệ thống Sidebar phải lọc Menu theo `Role` và `BranchType`.
- **Mục "Phân quyền & Cấu hình"**: Chỉ hiển thị cho tài khoản có quyền `ADMIN`. Các User khác không được thấy mục này.

## 3. Universal Approval Workflow (State Machine)
Mọi tính năng trong dự án đều phải tuân thủ luồng trạng thái sau:
- **DRAFT**: Yêu cầu đang được soạn thảo bởi Staff.
- **PENDING**: Staff đã gửi, chờ Trưởng chi nhánh duyệt.
- **IN_REVIEW**: Trưởng chi nhánh đã duyệt, đang chờ Giám đốc HQ duyệt (nếu tính năng yêu cầu 2 cấp).
- **APPROVED**: Đã được duyệt hoàn toàn.
- **REJECTED**: Bị từ chối và trả lại cho người tạo (Staff) để sửa đổi.

## 4. Feature Requirements
- **Trang Home (Ticket Center)**:
  - `Incoming`: Danh sách yêu cầu gửi đến User hiện tại để duyệt.
  - `Outgoing`: Danh sách yêu cầu User gửi đi hoặc bị trả lại.
  - Chỉ hiển thị Ticket cho những người có liên quan (Người tạo, Người duyệt).
- **Báo cáo (Reports)**: Chỉ dành cho Admin và Director. Tổng hợp dữ liệu theo từng tính năng.
- **Audit System**: Theo dõi hành vi người dùng theo từng module tính năng. Chỉ dành cho Admin.

## 5. Constraint Rules
- Một User không thể phê duyệt yêu cầu do chính mình tạo ra.
- Nếu một yêu cầu bị Reject ở bất kỳ cấp nào, luồng phê duyệt dừng lại và thông báo cho người tạo.