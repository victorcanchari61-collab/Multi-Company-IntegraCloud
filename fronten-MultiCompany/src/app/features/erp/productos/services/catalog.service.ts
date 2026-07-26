import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type {
  Brand,
  BrandRequest,
  Category,
  CategoryRequest,
  Currency,
  CurrencyRequest,
  PriceList,
  PriceListRequest,
  Subbrand,
  SubbrandRequest,
  Subcategory,
  SubcategoryRequest,
  UnitOfMeasure,
  UnitOfMeasureRequest,
} from '../models/catalog.model';

const API = environment.apiUrl;

/**
 * Maestros del catálogo de productos (todo menos el producto en sí).
 * Ninguna entidad se elimina: se desactivan vía POST /status.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  // ── Categorías ──
  getCategories() {
    return this.http.get<Category[]>(`${API}${API_ENDPOINTS.ERP_CATEGORIES}`);
  }
  createCategory(data: CategoryRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_CATEGORIES}`, data);
  }
  updateCategory(id: string, data: CategoryRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpCategory(id)}`, data);
  }

  // ── Subcategorías ──
  getSubcategories() {
    return this.http.get<Subcategory[]>(`${API}${API_ENDPOINTS.ERP_SUBCATEGORIES}`);
  }
  createSubcategory(data: SubcategoryRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_SUBCATEGORIES}`, data);
  }
  updateSubcategory(id: string, data: SubcategoryRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpSubcategory(id)}`, data);
  }

  // ── Marcas ──
  getBrands() {
    return this.http.get<Brand[]>(`${API}${API_ENDPOINTS.ERP_BRANDS}`);
  }
  createBrand(data: BrandRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_BRANDS}`, data);
  }
  updateBrand(id: string, data: BrandRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpBrand(id)}`, data);
  }

  // ── Submarcas ──
  getSubbrands() {
    return this.http.get<Subbrand[]>(`${API}${API_ENDPOINTS.ERP_SUBBRANDS}`);
  }
  createSubbrand(data: SubbrandRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_SUBBRANDS}`, data);
  }
  updateSubbrand(id: string, data: SubbrandRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpSubbrand(id)}`, data);
  }

  // ── Unidades de medida ──
  getUnits() {
    return this.http.get<UnitOfMeasure[]>(`${API}${API_ENDPOINTS.ERP_UNITS}`);
  }
  createUnit(data: UnitOfMeasureRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_UNITS}`, data);
  }
  updateUnit(id: string, data: UnitOfMeasureRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpUnit(id)}`, data);
  }
  setUnitStatus(id: string, active: boolean) {
    // Ojo: el backend de unidades espera { active }, no { isActive } como el resto.
    return this.http.post<void>(`${API}${API_ENDPOINTS.erpUnitStatus(id)}`, { active });
  }

  // ── Listas de precio ──
  getPriceLists() {
    return this.http.get<PriceList[]>(`${API}${API_ENDPOINTS.ERP_PRICE_LISTS}`);
  }
  createPriceList(data: PriceListRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_PRICE_LISTS}`, data);
  }
  updatePriceList(id: string, data: PriceListRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpPriceList(id)}`, data);
  }
  setPriceListStatus(id: string, isActive: boolean) {
    return this.http.post<void>(`${API}${API_ENDPOINTS.erpPriceListStatus(id)}`, { isActive });
  }

  // ── Monedas ──
  getCurrencies() {
    return this.http.get<Currency[]>(`${API}${API_ENDPOINTS.ERP_CURRENCIES}`);
  }
  createCurrency(data: CurrencyRequest) {
    return this.http.post<string>(`${API}${API_ENDPOINTS.ERP_CURRENCIES}`, data);
  }
  updateCurrency(id: string, data: CurrencyRequest) {
    return this.http.put<void>(`${API}${API_ENDPOINTS.erpCurrency(id)}`, data);
  }
  setCurrencyStatus(id: string, isActive: boolean) {
    return this.http.post<void>(`${API}${API_ENDPOINTS.erpCurrencyStatus(id)}`, { isActive });
  }
}
