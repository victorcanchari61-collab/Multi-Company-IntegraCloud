import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { ListParams, PagedResult } from '../../shared/models/iam.model';
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly http = inject(HttpClient);

  getCompanies(params: ListParams = {}) {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<PagedResult<Company>>(`${environment.apiUrl}${API_ENDPOINTS.COMPANIES}`, {
      params: httpParams,
    });
  }

  getCompany(id: string) {
    return this.http.get<Company>(`${environment.apiUrl}${API_ENDPOINTS.company(id)}`);
  }

  createCompany(data: CreateCompanyRequest) {
    return this.http.post<string>(`${environment.apiUrl}${API_ENDPOINTS.COMPANIES}`, data);
  }

  updateCompany(id: string, data: UpdateCompanyRequest) {
    return this.http.put<void>(`${environment.apiUrl}${API_ENDPOINTS.company(id)}`, data);
  }

  suspendCompany(id: string) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.companySuspend(id)}`, {});
  }

  activateCompany(id: string) {
    return this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.companyActivate(id)}`, {});
  }
}
