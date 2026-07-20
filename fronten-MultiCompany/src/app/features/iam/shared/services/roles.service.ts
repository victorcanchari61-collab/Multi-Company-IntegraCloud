import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { Role } from '../models/iam.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);

  getRoles(companyId: string) {
    return this.http.get<Role[]>(`${environment.apiUrl}${API_ENDPOINTS.companyRoles(companyId)}`);
  }
}
