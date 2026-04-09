export interface RequestTypeItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRequestTypePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}
