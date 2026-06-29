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
  ticketDescription?: string | null
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
  stockMin?: number | null
  stockMax?: number | null
  isActive: boolean
}

export interface ProductRequest {
  name: string
  description?: string | null
  ticketDescription?: string | null
  sku?: string | null
  barcode?: string | null
  categoryId?: string | null
  subcategoryId?: string | null
  brandId?: string | null
  subbrandId?: string | null
  unitOfMeasureId?: string | null
  salePrice?: number | null
  costPrice?: number | null
  stockMin?: number | null
  stockMax?: number | null
  isActive?: boolean
}

// ── Presentaciones ──

export interface ProductPresentation {
  id: string
  productId: string
  name: string
  unitOfMeasureId: string | null
  unitOfMeasureName?: string
  factor: number
  isBase: boolean
  sortOrder: number
  isActive: boolean
}

export interface ProductPresentationRequest {
  name: string
  unitOfMeasureId?: string | null
  factor: number
  isBase: boolean
  sortOrder: number
}

// ── Listas de precios ──

export interface PriceList {
  id: string
  name: string
  description: string | null
  type: string // "purchase" | "sale" | "both"
  isActive: boolean
}

export interface PriceListRequest {
  name: string
  description?: string | null
  type: string
}

// ── Monedas ──

export interface Currency {
  id: string
  code: string // PEN, USD, EUR
  name: string
  symbol: string | null
  isActive: boolean
}

export interface CurrencyRequest {
  code: string
  name: string
  symbol?: string | null
}

// ── Precios de producto ──

export interface ProductPrice {
  id: string
  productId: string
  presentationId: string
  presentationName?: string
  priceListId: string
  priceListName?: string
  currencyId: string
  currencyCode?: string
  purchasePrice: number | null
  salePrice: number | null
}

export interface ProductPriceEntry {
  presentationId: string
  priceListId: string
  currencyId: string
  purchasePrice?: number | null
  salePrice?: number | null
}

// ── Lotes ──

export interface ProductLot {
  id: string
  productId: string
  number: string
  expiryDate: string | null
  initialStock: number
  createdAt: string
}

export interface ProductLotRequest {
  number: string
  expiryDate?: string | null
  initialStock: number
}
