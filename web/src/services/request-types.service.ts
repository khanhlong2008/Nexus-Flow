import apiClient from '../lib/api-client';
import type {
  CreateRequestTypePayload,
  RequestTypeItem,
  UpdateRequestTypePayload,
} from '../types/request-type';

export async function getActiveRequestTypes(): Promise<RequestTypeItem[]> {
  const response = await apiClient.get<RequestTypeItem[]>('/request-types');
  return response.data;
}

export async function getManageRequestTypes(): Promise<RequestTypeItem[]> {
  const response = await apiClient.get<RequestTypeItem[]>('/request-types/manage');
  return response.data;
}

export async function createRequestType(
  payload: CreateRequestTypePayload,
): Promise<RequestTypeItem> {
  const response = await apiClient.post<RequestTypeItem>('/request-types', payload);
  return response.data;
}

export async function updateRequestType(
  id: string,
  payload: UpdateRequestTypePayload,
): Promise<RequestTypeItem> {
  const response = await apiClient.patch<RequestTypeItem>(`/request-types/${id}`, payload);
  return response.data;
}
