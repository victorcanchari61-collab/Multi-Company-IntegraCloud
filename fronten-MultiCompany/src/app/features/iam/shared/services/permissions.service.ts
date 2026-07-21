import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { Permission } from '../models/iam.model';

// Nombre distinto de core/auth/permissions.service.ts (PermissionsService, chequea permisos del
// usuario logueado): este es el catálogo completo de permisos disponibles para armar el checklist
// del RolePermissionsDialog.
@Injectable({ providedIn: 'root' })
export class PermissionCatalogService {
  private readonly http = inject(HttpClient);

  getAllPermissions() {
    return this.http.get<Permission[]>(`${environment.apiUrl}${API_ENDPOINTS.PERMISSIONS}`);
  }
}
