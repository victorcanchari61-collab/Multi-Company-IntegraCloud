import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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
import { ApiError } from '@/lib/api'
import { useBrands, useCategories } from '../queries/useProducts'
import { useUnits } from '../queries/useUnits'
import type { Product, ProductRequest } from '../types/erp'

// Los precios se manejan como string en el form (input numérico) y se convierten al enviar.
const priceField = z
  .string()
  .optional()
  .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Número inválido (≥ 0)')

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(2000).optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitOfMeasureId: z.string().optional(),
  salePrice: priceField,
  costPrice: priceField,
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

  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { data: units } = useUnits()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      categoryId: '',
      brandId: '',
      unitOfMeasureId: '',
      salePrice: '',
      costPrice: '',
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? '',
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        categoryId: product.categoryId ?? '',
        brandId: product.brandId ?? '',
        unitOfMeasureId: product.unitOfMeasureId ?? '',
        salePrice: product.salePrice != null ? String(product.salePrice) : '',
        costPrice: product.costPrice != null ? String(product.costPrice) : '',
      })
    }
  }, [product, form])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        sku: data.sku?.trim() || null,
        barcode: data.barcode?.trim() || null,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        unitOfMeasureId: data.unitOfMeasureId || null,
        salePrice: data.salePrice && data.salePrice.trim() !== '' ? Number(data.salePrice) : null,
        costPrice: data.costPrice && data.costPrice.trim() !== '' ? Number(data.costPrice) : null,
      }

      if (isEdit && product) {
        await onUpdate(product.id, payload)
        toast.success('Producto actualizado')
        onClose?.()
      } else {
        await onCreate(payload)
        toast.success('Producto creado')
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>
              Completa los datos del producto. Los campos con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del producto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de barras</FormLabel>
                      <FormControl>
                        <Input placeholder="EAN / UPC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descripción del producto" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v ?? '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v ?? '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitOfMeasureId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de medida</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v ?? '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {units?.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio venta</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" min="0" placeholder="0.00" {...field} />
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
                      <FormLabel>Precio costo</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" min="0" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                {isEdit && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
