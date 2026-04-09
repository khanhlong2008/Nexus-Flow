import apiClient from '../lib/api-client';
import type { ApprovalRequestResponse } from '../types/approval-request';

export interface CreateApprovalRequestPayload {
  title: string;
  requestType: string;
  description?: string;
  payload?: Record<string, unknown>;
}

export async function createApprovalRequest(
  data: CreateApprovalRequestPayload,
): Promise<ApprovalRequestResponse> {
  const response = await apiClient.post<ApprovalRequestResponse>(
    '/approval-requests',
    data,
  );
  return response.data;
}
