export type ApprovalStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type RequestType = 'CARD' | 'SAVINGS' | 'BOND';

export const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'CARD', label: 'Thẻ' },
  { value: 'SAVINGS', label: 'Sổ tiết kiệm' },
  { value: 'BOND', label: 'Trái phiếu' },
];

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  CARD: 'Thẻ',
  SAVINGS: 'Sổ tiết kiệm',
  BOND: 'Trái phiếu',
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
