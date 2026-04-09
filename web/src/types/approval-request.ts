import type { UserRole } from './menu';

export type ApprovalStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type RequestType = string;

export const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'LEAVE', label: 'Nghỉ phép' },
  { value: 'EXPENSE', label: 'Hoàn ứng chi phí' },
  { value: 'PURCHASE', label: 'Mua sắm' },
  { value: 'CARD', label: 'Mở thẻ' },
];

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  LEAVE: 'Nghỉ phép',
  EXPENSE: 'Hoàn ứng chi phí',
  PURCHASE: 'Mua sắm',
  CARD: 'Thẻ',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  DRAFT: 'Nháp',
  PENDING: 'Chờ duyệt',
  IN_REVIEW: 'Đang xem xét',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export interface ApprovalRequestCreator {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApprovalRequestBranch {
  id: string;
  name: string;
}

export interface ApprovalRequestApprover {
  id: string;
  name: string;
}

export interface ApprovalRequestResponse {
  id: string;
  title: string;
  description: string | null;
  requestType: string;
  status: ApprovalStatus;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  currentApproverId: string | null;
  branchId: string;
  creator?: ApprovalRequestCreator;
  currentApprover?: ApprovalRequestApprover | null;
  branch?: ApprovalRequestBranch;
}
