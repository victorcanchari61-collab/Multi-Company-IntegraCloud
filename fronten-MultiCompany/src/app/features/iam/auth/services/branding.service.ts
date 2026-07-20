import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';

export interface CompanyBranding {
  slug: string;
  name: string;
  logoUrl: string | null;
}

/** Branding público de una empresa por subdominio (endpoint sin auth). */
@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly http = inject(HttpClient);

  getBySlug(slug: string) {
    return this.http.get<CompanyBranding>(`${environment.apiUrl}${API_ENDPOINTS.companyBranding(slug)}`);
  }
}
