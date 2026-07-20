import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { RucInfo } from '../models/lookup.model';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);

  lookupRuc(ruc: string) {
    return this.http.get<RucInfo>(`${environment.apiUrl}${API_ENDPOINTS.lookupRuc(ruc)}`);
  }
}
