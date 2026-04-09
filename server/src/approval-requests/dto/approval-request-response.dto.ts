import { UserRole } from '@prisma/client';

export interface ApprovalRequestCreatorDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApprovalRequestBranchDto {
  id: string;
  name: string;
}

export interface ApprovalRequestApproverDto {
  id: string;
  name: string;
}

export interface ApprovalRequestResponseDto {
  id: string;
  title: string;
  description: string | null;
  requestType: string;
  status: string;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  currentApproverId: string | null;
  branchId: string;
  creator?: ApprovalRequestCreatorDto;
  currentApprover?: ApprovalRequestApproverDto | null;
  branch?: ApprovalRequestBranchDto;
}
