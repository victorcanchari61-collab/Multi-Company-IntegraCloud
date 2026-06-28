import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Brand,
  BrandRequest,
  Category,
  CategoryRequest,
  Product,
  ProductRequest,
  Subbrand,
  SubbrandRequest,
  Subcategory,
  SubcategoryRequest,
} from '../types/erp'

// ── Categories ──

export const getCategories = (): Promise<Category[]> =>
  api.get<Category[]>(API_ENDPOINTS.ERP.categories)

export const createCategory = (data: CategoryRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.categories, data)

export const updateCategory = (id: string, data: CategoryRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.category(id), data)

// ── Subcategories ──

export const getSubcategories = (): Promise<Subcategory[]> =>
  api.get<Subcategory[]>(API_ENDPOINTS.ERP.subcategories)

export const getSubcategoriesByCategory = (categoryId: string): Promise<Subcategory[]> =>
  api.get<Subcategory[]>(API_ENDPOINTS.ERP.subcategoryByCategory(categoryId))

export const createSubcategory = (data: SubcategoryRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.subcategories, data)

export const updateSubcategory = (id: string, data: SubcategoryRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.subcategory(id), data)

// ── Brands ──

export const getBrands = (): Promise<Brand[]> =>
  api.get<Brand[]>(API_ENDPOINTS.ERP.brands)

export const createBrand = (data: BrandRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.brands, data)

export const updateBrand = (id: string, data: BrandRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.brand(id), data)

// ── Subbrands ──

export const getSubbrands = (): Promise<Subbrand[]> =>
  api.get<Subbrand[]>(API_ENDPOINTS.ERP.subbrands)

export const getSubbrandsByBrand = (brandId: string): Promise<Subbrand[]> =>
  api.get<Subbrand[]>(API_ENDPOINTS.ERP.subbrandByBrand(brandId))

export const createSubbrand = (data: SubbrandRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.subbrands, data)

export const updateSubbrand = (id: string, data: SubbrandRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.subbrand(id), data)

// ── Products ──

export const getProducts = (): Promise<Product[]> =>
  api.get<Product[]>(API_ENDPOINTS.ERP.products)

export const getProductById = (id: string): Promise<Product> =>
  api.get<Product>(API_ENDPOINTS.ERP.product(id))

export const createProduct = (data: ProductRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.products, data)

export const updateProduct = (id: string, data: ProductRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.product(id), data)

export const setProductStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(API_ENDPOINTS.ERP.productStatus(id), { isActive })
