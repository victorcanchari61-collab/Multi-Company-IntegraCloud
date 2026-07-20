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

// Versión mínima: solo lo que necesita el selector de roles en el formulario de usuarios.
// Se amplía (rolSistema, restrictions, jerarquía) cuando se construya la página de Roles.
export interface Role {
  id: string;
  name: string;
  description: string | null;
}
