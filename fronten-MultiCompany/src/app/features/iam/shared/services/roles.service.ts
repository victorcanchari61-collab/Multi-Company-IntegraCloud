import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { CreateRoleRequest, Role, RoleDetail, RoleTreeDto, UpdateRoleRequest } from '../models/iam.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);

  getRoles(companyId: string) {
    return this.http.get<Role[]>(`${environment.apiUrl}${API_ENDPOINTS.companyRoles(companyId)}`);
  }

  getRoleTree(companyId: string) {
    return this.http.get<RoleTreeDto[]>(`${environment.apiUrl}${API_ENDPOINTS.companyRoleTree(companyId)}`);
  }

  getRoleById(companyId: string, roleId: string) {
    return this.http.get<RoleDetail>(`${environment.apiUrl}${API_ENDPOINTS.companyRole(companyId, roleId)}`);
  }

  createRole(companyId: string, data: CreateRoleRequest) {
    return this.http.post<string>(`${environment.apiUrl}${API_ENDPOINTS.companyRoles(companyId)}`, data);
  }

  updateRole(companyId: string, roleId: string, data: UpdateRoleRequest) {
    return this.http.put<void>(`${environment.apiUrl}${API_ENDPOINTS.companyRole(companyId, roleId)}`, data);
  }

  deleteRole(companyId: string, roleId: string) {
    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.companyRole(companyId, roleId)}`);
  }

  assignPermissionsToRole(companyId: string, roleId: string, permissionIds: string[]) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.companyRolePermissions(companyId, roleId)}`, {
      permissionIds,
    });
  }
}
