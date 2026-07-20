import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { AuthTokens, AuthUser, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(data: LoginRequest) {
    return this.http.post<AuthTokens>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, data);
  }

  logout(refreshToken: string) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, { refreshToken });
  }

  getMe() {
    return this.http.get<AuthUser>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.ME}`);
  }

  getMyPermissions() {
    return this.http.get<string[]>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.MY_PERMISSIONS}`);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
      currentPassword,
      newPassword,
    });
  }
}
