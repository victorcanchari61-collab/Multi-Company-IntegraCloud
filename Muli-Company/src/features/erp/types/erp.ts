export interface UnitOfMeasure {
  id: string
  name: string
  abbreviation: string
  isActive: boolean
}

export interface UnitOfMeasureRequest {
  name: string
  abbreviation: string
}

// ── Catálogo de productos ──

export interface Category {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export interface CategoryRequest {
  name: string
  description?: string | null
}

export interface Subcategory {
  id: string
  categoryId: string
  categoryName?: string
  name: string
  description: string | null
  isActive: boolean
}

export interface SubcategoryRequest {
  categoryId: string
  name: string
  description?: string | null
}

export interface Brand {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export interface BrandRequest {
  name: string
  description?: string | null
}

export interface Subbrand {
  id: string
  brandId: string
  brandName?: string
  name: string
  description: string | null
  isActive: boolean
}

export interface SubbrandRequest {
  brandId: string
  name: string
  description?: string | null
}

export interface Product {
  id: string
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  categoryId: string | null
  categoryName?: string
  subcategoryId: string | null
  subcategoryName?: string
  brandId: string | null
  brandName?: string
  subbrandId: string | null
  subbrandName?: string
  unitOfMeasureId: string | null
  unitOfMeasureName?: string
  salePrice: number | null
  costPrice: number | null
  isActive: boolean
}

export interface ProductRequest {
  name: string
  description?: string | null
  sku?: string | null
  barcode?: string | null
  categoryId?: string | null
  subcategoryId?: string | null
  brandId?: string | null
  subbrandId?: string | null
  unitOfMeasureId?: string | null
  salePrice?: number | null
  costPrice?: number | null
}
