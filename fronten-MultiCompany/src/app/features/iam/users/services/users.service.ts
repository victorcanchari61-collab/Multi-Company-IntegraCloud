import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { ListParams, PagedResult } from '../../shared/models/iam.model';
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  IamUser,
  IamUserDetail,
  UpdateUserRequest,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(companyId: string, params: ListParams = {}) {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<PagedResult<IamUser>>(`${environment.apiUrl}${API_ENDPOINTS.companyUsers(companyId)}`, {
      params: httpParams,
    });
  }

  getUserById(companyId: string, userId: string) {
    return this.http.get<IamUserDetail>(`${environment.apiUrl}${API_ENDPOINTS.companyUser(companyId, userId)}`);
  }

  createUser(companyId: string, data: CreateUserRequest) {
    return this.http.post<string>(`${environment.apiUrl}${API_ENDPOINTS.companyUsers(companyId)}`, data);
  }

  updateUser(companyId: string, userId: string, data: UpdateUserRequest) {
    return this.http.put<void>(`${environment.apiUrl}${API_ENDPOINTS.companyUser(companyId, userId)}`, data);
  }

  deactivateUser(companyId: string, userId: string) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.companyUserDeactivate(companyId, userId)}`, {});
  }

  reactivateUser(companyId: string, userId: string) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.companyUserReactivate(companyId, userId)}`, {});
  }

  changePassword(companyId: string, userId: string, data: ChangePasswordRequest) {
    return this.http.post<void>(
      `${environment.apiUrl}${API_ENDPOINTS.companyUserChangePassword(companyId, userId)}`,
      data,
    );
  }

  assignRolesToUser(companyId: string, userId: string, roleIds: string[]) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.companyUserRoles(companyId, userId)}`, {
      roleIds,
    });
  }
}
