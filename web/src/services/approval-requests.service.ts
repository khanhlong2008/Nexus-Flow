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

export async function getIncomingRequests(): Promise<ApprovalRequestResponse[]> {
  const response = await apiClient.get<ApprovalRequestResponse[]>(
    '/approval-requests/incoming',
  );
  return response.data;
}

export async function getOutgoingRequests(): Promise<ApprovalRequestResponse[]> {
  const response = await apiClient.get<ApprovalRequestResponse[]>(
    '/approval-requests/outgoing',
  );
  return response.data;
}

export async function approveRequest(
  id: string,
  comment?: string,
): Promise<ApprovalRequestResponse> {
  const response = await apiClient.patch<ApprovalRequestResponse>(
    `/approval-requests/${id}/approve`,
    { comment },
  );
  return response.data;
}

export async function rejectRequest(
  id: string,
  comment: string,
): Promise<ApprovalRequestResponse> {
  const response = await apiClient.patch<ApprovalRequestResponse>(
    `/approval-requests/${id}/reject`,
    { comment },
  );
  return response.data;
}
