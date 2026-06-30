import { useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import {
  useBrands,
  useCategories,
  useCreateBrand,
  useCreateCategory,
  useCreateSubbrand,
  useCreateSubcategory,
  useSubbrands,
  useSubcategories,
} from '../queries/useProducts'
import { useCreateUnit, useUnits } from '../queries/useUnits'
import {
  useCreateProductPresentation,
  useDeleteProductPresentation,
  useProductPresentations,
  useUpdateProductPresentation,
} from '../queries/usePresentations'
import { useProductPrices, useSetProductPrices } from '../queries/useProductPrices'
import { usePriceLists } from '../queries/usePriceLists'
import { useCurrencies } from '../queries/useCurrencies'
import { productSchema, type ProductFormData } from '../components/product-form/product-form.schema'
import type { Product, ProductPriceEntry, ProductRequest } from '../types/erp'

export interface UseProductFormArgs {
  product?: Product | null
  onClose?: () => void
  onCreate: (data: ProductRequest) => Promise<unknown>
  onUpdate: (id: string, data: ProductRequest) => Promise<unknown>
}

/** Concentra TODA la lógica del formulario de producto: estado, datos, RHF y submit. */
export function useProductForm({ product, onClose, onCreate, onUpdate }: UseProductFormArgs) {
  const isEdit = Boolean(product)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchRowIdx, setSearchRowIdx] = useState<number | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const { data: categories } = useCategories()
  const { data: subcategories } = useSubcategories()
  const { data: brands } = useBrands()
  const { data: subbrands } = useSubbrands()
  const { data: units } = useUnits()
  const { data: priceLists } = usePriceLists()
  const { data: currencies } = useCurrencies()
  const { data: presentations } = useProductPresentations(product?.id ?? '')
  const { data: productPrices } = useProductPrices(product?.id ?? '')

  const createCat = useCreateCategory()
  const createSubcat = useCreateSubcategory()
  const createBrand = useCreateBrand()
  const createSubbrand = useCreateSubbrand()
  const createUnit = useCreateUnit()
  const createPresentation = useCreateProductPresentation(product?.id ?? '')
  const updatePresentation = useUpdateProductPresentation(product?.id ?? '')
  const deletePresentation = useDeleteProductPresentation(product?.id ?? '')
  const setPrices = useSetProductPrices(product?.id ?? '')

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      code: '',
      autoCode: !product,
      sku: product?.sku ?? '',
      barcode: product?.barcode ?? '',
      isActive: product ? (product.isActive ? 'true' : 'false') : 'true',
      categoryId: product?.categoryId ?? '',
      subcategoryId: product?.subcategoryId ?? '',
      brandId: product?.brandId ?? '',
      subbrandId: product?.subbrandId ?? '',
      unitOfMeasureId: product?.unitOfMeasureId ?? '',
      salePrice: product?.salePrice?.toString() ?? '',
      costPrice: product?.costPrice?.toString() ?? '',
      ticketDescription: product?.ticketDescription ?? '',
      stockMin: product?.stockMin?.toString() ?? '',
      stockMax: product?.stockMax?.toString() ?? '',
      loteNumber: product?.loteNumber ?? '',
      loteExpiry: product?.loteExpiry ?? '',
      loteStock: product?.loteStock?.toString() ?? '',
      loteStockFraction: product?.loteStockFraction?.toString() ?? '',
      technicalAction: product?.technicalAction ?? '',
      priceRows: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'priceRows' })

  const catId = form.watch('categoryId')
  const brandId = form.watch('brandId')

  const filteredSubcategories = useMemo(() => {
    if (!catId || !subcategories) return []
    return subcategories.filter((s) => s.categoryId === catId)
  }, [catId, subcategories])

  const filteredSubbrands = useMemo(() => {
    if (!brandId || !subbrands) return []
    return subbrands.filter((s) => s.brandId === brandId)
  }, [brandId, subbrands])

  // ── Carga las presentaciones existentes a priceRows al editar ──
  useEffect(() => {
    if (!presentations || !isEdit) return
    const rows = presentations
      .filter((p) => p.isActive)
      .map((p) => {
        const price = productPrices?.find((pp) => pp.presentationId === p.id)
        return {
          id: p.id,
          formatoVenta: p.name,
          factor: p.factor.toString(),
          unitOfMeasureId: p.unitOfMeasureId ?? '',
          productoC: p.complementaryProductName ?? '',
          complementaryProductId: p.complementaryProductId ?? '',
          cantidadC: p.complementaryQuantity > 0 ? p.complementaryQuantity.toString() : '',
          precioCompra: price?.purchasePrice?.toString() ?? '',
          porcentajeVenta: p.markupPercentage > 0 ? p.markupPercentage.toString() : '',
        }
      })
    form.setValue('priceRows', rows)
  }, [presentations, productPrices, isEdit, form])

  const defaultPriceListId = priceLists?.[0]?.id ?? ''
  const defaultCurrencyId = currencies?.[0]?.id ?? ''

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true)
    try {
      const payload: ProductRequest = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        sku: data.sku?.trim() || null,
        barcode: data.barcode?.trim() || null,
        isActive: data.isActive === 'true',
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
        brandId: data.brandId || null,
        subbrandId: data.subbrandId || null,
        unitOfMeasureId: data.unitOfMeasureId || null,
        salePrice: data.salePrice && data.salePrice.trim() !== '' ? Number(data.salePrice) : null,
        costPrice: data.costPrice && data.costPrice.trim() !== '' ? Number(data.costPrice) : null,
        ticketDescription: data.ticketDescription?.trim() || null,
        stockMin: data.stockMin ? Number(data.stockMin) : null,
        stockMax: data.stockMax ? Number(data.stockMax) : null,
        loteNumber: data.loteNumber?.trim() || null,
        loteExpiry: data.loteExpiry?.trim() || null,
        loteStock: data.loteStock && data.loteStock.trim() !== '' ? Number(data.loteStock) : null,
        loteStockFraction:
          data.loteStockFraction && data.loteStockFraction.trim() !== ''
            ? Number(data.loteStockFraction)
            : null,
        technicalAction: data.technicalAction?.trim() || null,
      }

      if (isEdit && product) {
        await onUpdate(product.id, payload)
      } else {
        await onCreate(payload)
      }

      // ── Sincroniza presentaciones ──
      const rows = data.priceRows ?? []
      const existingIds = new Set((presentations ?? []).filter((p) => p.isActive).map((p) => p.id))
      const submittedIds = new Set(rows.map((r) => r.id).filter(Boolean))

      for (const pres of presentations ?? []) {
        if (pres.isActive && !submittedIds.has(pres.id)) {
          await deletePresentation.mutateAsync(pres.id)
        }
      }

      const presentationIds: string[] = []
      for (const row of rows) {
        const name = row.formatoVenta?.trim()
        if (!name) continue
        const factor = row.factor && row.factor.trim() !== '' ? Number(row.factor) : 1
        const unitId = row.unitOfMeasureId || null
        const complementaryId = row.complementaryProductId?.trim() || null
        const complementaryQuantity =
          row.cantidadC && row.cantidadC.trim() !== '' ? Number(row.cantidadC) : 0
        const markupPercentage =
          row.porcentajeVenta && row.porcentajeVenta.trim() !== '' ? Number(row.porcentajeVenta) : 0
        if (row.id && existingIds.has(row.id)) {
          await updatePresentation.mutateAsync({
            id: row.id,
            data: {
              name,
              unitOfMeasureId: unitId,
              factor,
              isBase: false,
              sortOrder: 0,
              complementaryProductId: complementaryId,
              complementaryQuantity,
              markupPercentage,
            },
          })
          presentationIds.push(row.id)
        } else {
          const newId = (await createPresentation.mutateAsync({
            name,
            unitOfMeasureId: unitId,
            factor,
            isBase: false,
            sortOrder: 0,
            complementaryProductId: complementaryId,
            complementaryQuantity,
            markupPercentage,
          })) as unknown as string
          presentationIds.push(newId)
        }
      }

      // ── Upsert de precios ──
      if (defaultPriceListId && defaultCurrencyId && presentationIds.length > 0) {
        const entries: ProductPriceEntry[] = rows
          .map((r, i) => ({
            presentationId: presentationIds[i] ?? r.id ?? '',
            priceListId: defaultPriceListId,
            currencyId: defaultCurrencyId,
            purchasePrice:
              r.precioCompra && r.precioCompra.trim() !== '' ? Number(r.precioCompra) : null,
            salePrice: null,
          }))
          .filter((e) => e.presentationId)
        if (entries.length > 0) {
          await setPrices.mutateAsync(entries)
        }
      }

      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      if (isEdit) {
        onClose?.()
      } else {
        form.reset()
        setOpen(false)
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return {
    isEdit,
    open,
    setOpen,
    saving,
    searchRowIdx,
    setSearchRowIdx,
    imageInputRef,
    pdfInputRef,
    categories,
    brands,
    units,
    filteredSubcategories,
    filteredSubbrands,
    catId,
    brandId,
    createCat,
    createSubcat,
    createBrand,
    createSubbrand,
    createUnit,
    form,
    fields,
    append,
    remove,
    onSubmit,
    onClose,
  }
}

export type ProductFormApi = ReturnType<typeof useProductForm>
