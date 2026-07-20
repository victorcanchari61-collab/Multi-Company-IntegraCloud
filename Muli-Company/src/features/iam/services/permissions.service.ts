import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { PermissionNode } from '../types/iam'

export const getAllPermissions = (): Promise<PermissionNode[]> =>
  api.get<PermissionNode[]>(API_ENDPOINTS.PERMISSIONS)
