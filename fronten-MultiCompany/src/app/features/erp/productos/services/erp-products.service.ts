import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type {
  Product,
  ProductMedia,
  ProductPresentation,
  ProductPresentationRequest,
  ProductPrice,
  ProductPriceEntry,
  ProductRequest,
} from '../models/catalog.model';

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

  // ── Presentaciones (unidades derivadas del grid "Detalle de precios") ──

  getPresentations(productId: string) {
    return this.http.get<ProductPresentation[]>(`${API}${API_ENDPOINTS.erpProductPresentations(productId)}`);
  }

  createPresentation(productId: string, data: ProductPresentationRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.erpProductPresentations(productId)}`, data);
  }

  updatePresentation(productId: string, id: string, data: ProductPresentationRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpProductPresentation(productId, id)}`, data);
  }

  deletePresentation(productId: string, id: string) {
    return this.http.delete<void>(`${API}${API_ENDPOINTS.erpProductPresentation(productId, id)}`);
  }

  // ── Precios por presentación × lista × moneda ──

  getPrices(productId: string) {
    return this.http.get<ProductPrice[]>(`${API}${API_ENDPOINTS.erpProductPrices(productId)}`);
  }

  setPrices(productId: string, prices: ProductPriceEntry[]) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpProductPrices(productId)}`, { prices });
  }
}
