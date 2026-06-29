import { useMemo, useRef, useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CirclePlus, Plus, Trash2, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useProductPresentations, useCreateProductPresentation, useUpdateProductPresentation, useDeleteProductPresentation } from '../queries/usePresentations'
import { useProductPrices, useSetProductPrices } from '../queries/useProductPrices'
import { usePriceLists } from '../queries/usePriceLists'
import { useCurrencies } from '../queries/useCurrencies'
import { ProductSearchDialog } from './ProductSearchDialog'
import type { Product, ProductRequest, ProductPriceEntry } from '../types/erp'

const priceField = z
  .string()
  .optional()
  .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Número inválido (≥ 0)')

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(2000).optional(),
  code: z.string().optional(),
  autoCode: z.boolean().optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  isActive: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  subbrandId: z.string().optional(),
  unitOfMeasureId: z.string().optional(),
  salePrice: priceField,
  costPrice: priceField,
  ticketDescription: z.string().max(500).optional(),
  stockMin: z.string().optional(),
  stockMax: z.string().optional(),
  loteNumber: z.string().optional(),
  loteExpiry: z.string().optional(),
  loteStock: z.string().optional(),
  loteStockFraction: z.string().optional(),
  technicalAction: z.string().max(2000).optional(),
  priceRows: z.array(z.object({
    id: z.string().optional(),
    formatoVenta: z.string().optional(),
    factor: z.string().optional(),
    unitOfMeasureId: z.string().optional(),
    productoC: z.string().optional(),
    complementaryProductId: z.string().optional(),
    cantidadC: z.string().optional(),
    precioCompra: z.string().optional(),
    porcentajeVenta: z.string().optional(),
  })).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  product?: Product | null
  onClose?: () => void
  onCreate: (data: ProductRequest) => Promise<unknown>
  onUpdate: (id: string, data: ProductRequest) => Promise<unknown>
}

export function ProductFormDialog({ product, onClose, onCreate, onUpdate }: Props) {
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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
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

  // ── Load presentations into priceRows on edit ──
  useEffect(() => {
    if (!presentations || !isEdit) return
    const rows = presentations.filter(p => p.isActive).map((p) => {
      const price = productPrices?.find(pp => pp.presentationId === p.id)
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

  const onSubmit = async (data: FormData) => {
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
        loteStockFraction: data.loteStockFraction && data.loteStockFraction.trim() !== '' ? Number(data.loteStockFraction) : null,
        technicalAction: data.technicalAction?.trim() || null,
      }

      if (isEdit && product) {
        await onUpdate(product.id, payload)
      } else {
        await onCreate(payload)
      }

      // ── Sync presentations ──
      const rows = data.priceRows ?? []
      const existingIds = new Set((presentations ?? []).filter(p => p.isActive).map(p => p.id))
      const submittedIds = new Set(rows.map(r => r.id).filter(Boolean))

      // Delete removed presentations
      for (const pres of presentations ?? []) {
        if (pres.isActive && !submittedIds.has(pres.id)) {
          await deletePresentation.mutateAsync(pres.id)
        }
      }

      // Create or update presentations
      let presentationIds: string[] = []
      for (const row of rows) {
        const name = row.formatoVenta?.trim()
        if (!name) continue
        const factor = row.factor && row.factor.trim() !== '' ? Number(row.factor) : 1
        const unitId = row.unitOfMeasureId || null
        const complementaryId = row.complementaryProductId?.trim() || null
        const complementaryQuantity = row.cantidadC && row.cantidadC.trim() !== '' ? Number(row.cantidadC) : 0
        const markupPercentage = row.porcentajeVenta && row.porcentajeVenta.trim() !== '' ? Number(row.porcentajeVenta) : 0
        if (row.id && existingIds.has(row.id)) {
          await updatePresentation.mutateAsync({
            id: row.id,
            data: {
              name, unitOfMeasureId: unitId, factor, isBase: false, sortOrder: 0,
              complementaryProductId: complementaryId,
              complementaryQuantity,
              markupPercentage,
            },
          })
          presentationIds.push(row.id)
        } else {
          const newId = await createPresentation.mutateAsync({
            name, unitOfMeasureId: unitId, factor, isBase: false, sortOrder: 0,
            complementaryProductId: complementaryId,
            complementaryQuantity,
            markupPercentage,
          }) as unknown as string
          presentationIds.push(newId)
        }
      }

      // ── Upsert prices ──
      if (defaultPriceListId && defaultCurrencyId && presentationIds.length > 0) {
        const entries: ProductPriceEntry[] = rows
          .filter(r => r.id || !r.id)
          .map((r, i) => ({
            presentationId: presentationIds[i] ?? r.id ?? '',
            priceListId: defaultPriceListId,
            currencyId: defaultCurrencyId,
            purchasePrice: r.precioCompra && r.precioCompra.trim() !== '' ? Number(r.precioCompra) : null,
            salePrice: null,
          }))
          .filter(e => e.presentationId)
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

  return (
    <>
      {!isEdit && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nuevo producto
        </Button>
      )}
      <Dialog
        open={isEdit ? true : open}
        onOpenChange={isEdit ? (o) => !o && onClose?.() : setOpen}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>
              Completa los datos del producto. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Tabs defaultValue="datos">
                <TabsList className="w-full">
                  <TabsTrigger value="datos" className="flex-1">Datos iniciales</TabsTrigger>
                  <TabsTrigger value="lote-precios" className="flex-1">Lote y precios</TabsTrigger>
                  <TabsTrigger value="info" className="flex-1">Información adicional</TabsTrigger>
                </TabsList>

                <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1 pt-4 pb-1">
                  <TabsContent value="datos" className="space-y-5">
                    {/* ── Códigos y estado ── */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cód. Producto</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CÓDIGO DE PRODUCTO"
                                disabled={form.watch('autoCode')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="autoCode"
                        render={({ field }) => (
                          <FormItem className="mt-6">
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="autoCode"
                                  checked={field.value ?? true}
                                  onCheckedChange={(v) => {
                                    field.onChange(v === true)
                                    if (v) form.setValue('code', '')
                                  }}
                                />
                                <Label htmlFor="autoCode" className="text-xs font-normal">
                                  Código automático
                                </Label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cod. de barra</FormLabel>
                            <FormControl>
                              <Input placeholder="EAN / UPC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input placeholder="Código interno" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select value={field.value ?? 'true'} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Activo</SelectItem>
                                <SelectItem value="false">Inactivo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Nombre y descripción ── */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del producto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Cemento Sol Tipo I 42.5 kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Descripción <span className="text-muted-foreground">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descripción del producto" rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ticketDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Descripción ticket{' '}
                              <span className="text-muted-foreground">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Texto que aparecerá en el ticket"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Categorización ── */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                value={field.value ?? ''}
                                onValueChange={(v) => {
                                  field.onChange(v)
                                  form.setValue('subcategoryId', '')
                                }}
                                items={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories?.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <QuickCreateButton
                                label="categoría"
                                fields={[
                                  { label: 'Nombre', required: true },
                                  { label: 'Descripción', required: false },
                                ]}
                                onSave={([name, desc]) =>
                                  handleQuickCreate(createCat, 'categoryId', name, desc)
                                }
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subcategoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategoría</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                value={field.value ?? ''}
                                onValueChange={field.onChange}
                                disabled={!catId}
                                items={filteredSubcategories.map((s) => ({ value: s.id, label: s.name }))}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Seleccionar subcategoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredSubcategories.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <QuickCreateButton
                                label="subcategoría"
                                fields={[
                                  { label: 'Nombre', required: true },
                                ]}
                                onSave={([name]) =>
                                  handleQuickCreate(createSubcat, 'subcategoryId', name, catId)
                                }
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Marca y submarca ── */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="brandId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                value={field.value ?? ''}
                                onValueChange={(v) => {
                                  field.onChange(v)
                                  form.setValue('subbrandId', '')
                                }}
                                items={brands?.map((b) => ({ value: b.id, label: b.name })) ?? []}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Seleccionar marca" />
                                </SelectTrigger>
                                <SelectContent>
                                  {brands?.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {b.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <QuickCreateButton
                                label="marca"
                                fields={[
                                  { label: 'Nombre', required: true },
                                  { label: 'Descripción', required: false },
                                ]}
                                onSave={([name, desc]) =>
                                  handleQuickCreate(createBrand, 'brandId', name, desc)
                                }
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subbrandId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Submarca</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                value={field.value ?? ''}
                                onValueChange={field.onChange}
                                disabled={!brandId}
                                items={filteredSubbrands.map((s) => ({ value: s.id, label: s.name }))}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Seleccionar submarca" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredSubbrands.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <QuickCreateButton
                                label="submarca"
                                fields={[
                                  { label: 'Nombre', required: true },
                                ]}
                                onSave={([name]) =>
                                  handleQuickCreate(createSubbrand, 'subbrandId', name, brandId)
                                }
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Unidad, stock ── */}
                    <div className="grid gap-4 sm:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="unitOfMeasureId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidad de medida *</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                value={field.value ?? ''}
                                onValueChange={field.onChange}
                                items={units?.map((u) => ({ value: u.id, label: `${u.name} (${u.abbreviation})` })) ?? []}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="UND" />
                                </SelectTrigger>
                                <SelectContent>
                                  {units?.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                      {u.name} ({u.abbreviation})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <QuickCreateButton
                                label="unidad"
                                fields={[
                                  { label: 'Nombre', required: true },
                                  { label: 'Abreviatura', required: true },
                                ]}
                                onSave={([name, abbr]) =>
                                  handleQuickCreate(createUnit, 'unitOfMeasureId', name, abbr)
                                }
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stockMin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock mínimo</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stockMax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock máximo</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="lote-precios" className="space-y-5">
                    {/* ── Precios ── */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio de venta</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.0001" min="0" placeholder="0.0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio de costo</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.0001" min="0" placeholder="0.0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Lote inicial ── */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-3 text-xs font-semibold text-muted-foreground">
                          Lote inicial
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="loteNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° de lote</FormLabel>
                            <FormControl>
                              <Input placeholder="LOTE-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="loteExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vencimiento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="loteStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock entero</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="loteStockFraction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock fracción</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Detalle de precios ── */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Detalle de precios</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => append({
                        formatoVenta: '', factor: '', productoC: '', complementaryProductId: '', cantidadC: '', precioCompra: '', porcentajeVenta: '',
                      })}>
                        <Plus className="size-3.5 mr-1" /> Agregar unidad derivada
                      </Button>
                    </div>
                    <div className="rounded-lg border bg-card shadow-sm">
                      <Table>
                        <TableHeader className="[&_tr]:border-b-0">
                          <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0 w-8 text-center">#</TableHead>
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Formato de venta</TableHead>
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Factor</TableHead>
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Prod. complementario</TableHead>
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Cant. compl.</TableHead>
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">P. compra</TableHead>
                            <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">% venta</TableHead>
                            <TableHead className="relative h-[30px] px-1.5 py-0 text-xs font-medium text-primary-foreground w-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-muted-foreground py-6 text-xs">
                                Sin unidades derivadas. Haga clic en "Agregar unidad derivada".
                              </TableCell>
                            </TableRow>
                          )}
                          {fields.map((f, idx) => (
                            <TableRow key={f.id}>
                              <TableCell className="text-xs text-muted-foreground text-center">{idx + 1}</TableCell>
                              <TableCell>
                                <Select
                                  value={form.watch(`priceRows.${idx}.formatoVenta`) ?? ''}
                                  onValueChange={(v) => form.setValue(`priceRows.${idx}.formatoVenta`, v ?? '')}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="UND. DERIVADA" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CAJA">CAJA</SelectItem>
                                    <SelectItem value="BOLSA">BOLSA</SelectItem>
                                    <SelectItem value="PACK">PACK</SelectItem>
                                    <SelectItem value="DOCENA">DOCENA</SelectItem>
                                    <SelectItem value="UNIDAD">UNIDAD</SelectItem>
                                    <SelectItem value="MEDIA_DOCENA">MEDIA DOCENA</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  className="h-8 text-xs"
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  placeholder="1.000"
                                  value={form.watch(`priceRows.${idx}.factor`) ?? ''}
                                  onChange={(e) => form.setValue(`priceRows.${idx}.factor`, e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Input
                                    className="h-8 text-xs flex-1"
                                    placeholder="Buscar producto..."
                                    value={form.watch(`priceRows.${idx}.productoC`) ?? ''}
                                    onChange={(e) => form.setValue(`priceRows.${idx}.productoC`, e.target.value)}
                                  />
                                  <button type="button" onClick={() => setSearchRowIdx(idx)}>
                                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  className="h-8 text-xs"
                                  type="number"
                                  min="0"
                                  placeholder="Cant."
                                  value={form.watch(`priceRows.${idx}.cantidadC`) ?? ''}
                                  onChange={(e) => form.setValue(`priceRows.${idx}.cantidadC`, e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  className="h-8 text-xs"
                                  placeholder="S/. 0.0000"
                                  value={form.watch(`priceRows.${idx}.precioCompra`) ?? ''}
                                  onChange={(e) => form.setValue(`priceRows.${idx}.precioCompra`, e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Input
                                    className="h-8 text-xs w-16"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.watch(`priceRows.${idx}.porcentajeVenta`) ?? ''}
                                    onChange={(e) => form.setValue(`priceRows.${idx}.porcentajeVenta`, e.target.value)}
                                  />
                                  <span className="text-xs text-muted-foreground">%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <button type="button" onClick={() => remove(idx)} className="text-destructive hover:text-destructive/80">
                                  <Trash2 className="size-3.5" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="space-y-5">
                    {/* ── Adjuntar archivos ── */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FormLabel>
                          Imagen del producto{' '}
                          <span className="text-muted-foreground">(opcional)</span>
                        </FormLabel>
                        <div
                          className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => imageInputRef.current?.click()}
                          onKeyDown={(e) => { if (e.key === 'Enter') imageInputRef.current?.click() }}
                          role="button"
                          tabIndex={0}
                        >
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                          />
                          <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                          <Button type="button" variant="secondary" size="sm">
                            <Upload className="size-3.5 mr-1" /> Subir imagen
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">PNG, JPG o WebP</p>
                        </div>
                      </div>
                      <div>
                        <FormLabel>
                          Ficha técnica{' '}
                          <span className="text-muted-foreground">(opcional)</span>
                        </FormLabel>
                        <div
                          className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => pdfInputRef.current?.click()}
                          onKeyDown={(e) => { if (e.key === 'Enter') pdfInputRef.current?.click() }}
                          role="button"
                          tabIndex={0}
                        >
                          <input
                            ref={pdfInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                          />
                          <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                          <Button type="button" variant="secondary" size="sm">
                            <Upload className="size-3.5 mr-1" /> Subir ficha técnica
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">PDF</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Acción técnica ── */}
                    <FormField
                      control={form.control}
                      name="technicalAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Acción técnica{' '}
                            <span className="text-muted-foreground">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Instrucciones de uso, advertencias, aplicaciones recomendadas..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter>
                {isEdit && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProductSearchDialog
        open={searchRowIdx !== null}
        onOpenChange={(o) => { if (!o) setSearchRowIdx(null) }}
        onSelect={(product) => {
          if (searchRowIdx !== null) {
            form.setValue(`priceRows.${searchRowIdx}.productoC`, product.name)
            form.setValue(`priceRows.${searchRowIdx}.complementaryProductId`, product.id)
            if (product.salePrice != null) {
              form.setValue(`priceRows.${searchRowIdx}.precioCompra`, product.salePrice.toString())
            }
            setSearchRowIdx(null)
          }
        }}
      />
    </>
  )
}

// ── Helpers ──

async function handleQuickCreate(
  mutation: { mutateAsync: (...args: never[]) => Promise<string> },
  field: 'categoryId' | 'subcategoryId' | 'brandId' | 'subbrandId' | 'unitOfMeasureId',
  name: string,
  extra?: string,
) {
  if (!name.trim()) return
  try {
    const payload: Record<string, string> = { name: name.trim() }
    if (field === 'subcategoryId' && extra) payload.categoryId = extra
    else if (field === 'subbrandId' && extra) payload.brandId = extra
    else if (field === 'unitOfMeasureId' && extra) payload.abbreviation = extra
    else if (extra) payload.description = extra

    await mutation.mutateAsync(payload as never)
    toast.success(`"${name.trim()}" creado`)
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Error al crear')
  }
}

// ── Quick-create mini-modal ──

interface QcField {
  label: string
  required: boolean
}

function QuickCreateButton({
  label,
  fields,
  onSave,
}: {
  label: string
  fields: QcField[]
  onSave: (values: string[]) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''))
  const [saving, setSaving] = useState(false)
  const disabled = fields.some((f, i) => f.required && !values[i]?.trim())

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(values)
      setOpen(false)
      setValues(fields.map(() => ''))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Nueva ${label}`}
        className="shrink-0 self-end pb-1 text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-transform"
      >
        <CirclePlus className="size-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.label}>
                <FormLabel>
                  {f.required && <span className="text-destructive mr-1">*</span>}
                  {f.label}
                </FormLabel>
                <Input
                  placeholder={f.label}
                  value={values[i]}
                  onChange={(e) =>
                    setValues((prev) => {
                      const next = [...prev]
                      next[i] = e.target.value
                      return next
                    })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={disabled || saving} onClick={handleSave}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
