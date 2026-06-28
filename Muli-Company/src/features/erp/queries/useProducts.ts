import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBrand,
  createCategory,
  createProduct,
  createSubbrand,
  createSubcategory,
  getBrands,
  getCategories,
  getProducts,
  getSubbrands,
  getSubcategories,
  setProductStatus,
  updateBrand,
  updateCategory,
  updateProduct,
  updateSubbrand,
  updateSubcategory,
} from '../services/products.service'
import type {
  BrandRequest,
  CategoryRequest,
  ProductRequest,
  SubbrandRequest,
  SubcategoryRequest,
} from '../types/erp'

export const catalogKeys = {
  categories: { all: ['erp', 'categories'] as const },
  subcategories: { all: ['erp', 'subcategories'] as const },
  brands: { all: ['erp', 'brands'] as const },
  subbrands: { all: ['erp', 'subbrands'] as const },
  products: { all: ['erp', 'products'] as const },
}

// ── Categories ──

export const useCategories = () =>
  useQuery({ queryKey: catalogKeys.categories.all, queryFn: getCategories })

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories.all }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryRequest }) => updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories.all }),
  })
}

// ── Subcategories ──

export const useSubcategories = () =>
  useQuery({ queryKey: catalogKeys.subcategories.all, queryFn: getSubcategories })

export function useCreateSubcategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.subcategories.all }),
  })
}

export function useUpdateSubcategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubcategoryRequest }) => updateSubcategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.subcategories.all }),
  })
}

// ── Brands ──

export const useBrands = () =>
  useQuery({ queryKey: catalogKeys.brands.all, queryFn: getBrands })

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.brands.all }),
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandRequest }) => updateBrand(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.brands.all }),
  })
}

// ── Subbrands ──

export const useSubbrands = () =>
  useQuery({ queryKey: catalogKeys.subbrands.all, queryFn: getSubbrands })

export function useCreateSubbrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSubbrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.subbrands.all }),
  })
}

export function useUpdateSubbrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubbrandRequest }) => updateSubbrand(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.subbrands.all }),
  })
}

// ── Products ──

export const useProducts = () =>
  useQuery({ queryKey: catalogKeys.products.all, queryFn: getProducts })

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.products.all }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductRequest }) => updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.products.all }),
  })
}

export function useSetProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setProductStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.products.all }),
  })
}
