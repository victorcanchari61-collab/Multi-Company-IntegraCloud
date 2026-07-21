export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: number;
}

export const ENTITY_STATUS = {
  ACTIVE: 1,
  SUSPENDED: 2,
} as const;

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  key: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string | null;
}
