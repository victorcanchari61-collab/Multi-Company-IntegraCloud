import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, catchError, shareReplay, throwError } from 'rxjs';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { Permission } from '../models/iam.model';

// Nombre distinto de core/auth/permissions.service.ts (PermissionsService, chequea permisos del
// usuario logueado): este es el catálogo completo de permisos disponibles para armar el checklist
// del RolePermissionsDialog.
@Injectable({ providedIn: 'root' })
export class PermissionCatalogService {
  private readonly http = inject(HttpClient);

  // El catálogo es estático durante la sesión (solo cambia con un seed nuevo del backend):
  // se cachea para no refetchear en cada apertura del diálogo de permisos.
  private catalog$: Observable<Permission[]> | null = null;

  getAllPermissions(): Observable<Permission[]> {
    this.catalog$ ??= this.http.get<Permission[]>(`${environment.apiUrl}${API_ENDPOINTS.PERMISSIONS}`).pipe(
      catchError((error) => {
        this.catalog$ = null;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.catalog$;
  }
}
