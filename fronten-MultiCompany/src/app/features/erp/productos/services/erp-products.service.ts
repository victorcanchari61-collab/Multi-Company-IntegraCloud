import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { Product, ProductMedia, ProductRequest } from '../models/catalog.model';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ErpProductsService {
  private readonly http = inject(HttpClient);

  getProducts() {
    return this.http.get<Product[]>(`${API}${API_ENDPOINTS.ERP_PRODUCTS}`);
  }

  /** Imagen y ficha técnica: viajan fuera del listado por peso (data-URLs). */
  getProductMedia(id: string) {
    return this.http.get<ProductMedia>(`${API}${API_ENDPOINTS.erpProductMedia(id)}`);
  }

  createProduct(data: ProductRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_PRODUCTS}`, data);
  }

  updateProduct(id: string, data: ProductRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpProduct(id)}`, data);
  }

  setProductStatus(id: string, isActive: boolean) {
    return this.http.post<void>(`${API}${API_ENDPOINTS.erpProductStatus(id)}`, { isActive });
  }
}
