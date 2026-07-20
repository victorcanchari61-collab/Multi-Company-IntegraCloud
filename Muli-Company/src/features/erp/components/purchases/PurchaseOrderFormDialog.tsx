import { useCallback, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { ApiError } from '@/lib/api'
import { useSuppliers } from '../../queries/usePurchases'
import { useProducts } from '../../queries/useProducts'
import { ProductSearchDialog } from '../ProductSearchDialog'
import type { CreatePurchaseOrderRequest, PurchaseOrderDto } from '../../services/purchases.service'
import type { Product } from '../../types/erp'

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Requerido'),
  productName: z.string(),
  quantity: z.number().positive('Debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'Debe ser 0 o mayor'),
})

const schema = z.object({
  supplierId: z.string().min(1, 'Seleccione un proveedor'),
  issueDate: z.string().min(1, 'Requerido'),
  expectedDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'Agregue al menos un producto'),
})

type FormData = z.infer<typeof schema>

interface Props {
  supplier?: { id: string; name: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: CreatePurchaseOrderRequest) => Promise<unknown>
  initialData?: PurchaseOrderDto
  defaultItems?: { productId: string; productName: string; quantity: number; unitPrice: number }[]
  defaultNotes?: string
}

export function PurchaseOrderFormDialog({ supplier, open, onOpenChange, onSave, initialData, defaultItems, defaultNotes }: Props) {
  const { data: suppliers } = useSuppliers()
  const { data: products } = useProducts()
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialData

  const today = new Date().toISOString().split('T')[0]

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: supplier?.id ?? '',
      issueDate: today,
      expectedDate: '',
      paymentTerms: '',
      currency: 'PEN',
      notes: '',
      items: [],
    },
  })

  const resetForm = () => {
    form.reset({
      supplierId: initialData?.supplierId ?? supplier?.id ?? '',
      issueDate: initialData?.issueDate ? initialData.issueDate.slice(0, 10) : today,
      expectedDate: initialData?.expectedDate ? initialData.expectedDate.slice(0, 10) : '',
      paymentTerms: '',
      currency: 'PEN',
      notes: initialData?.notes ?? defaultNotes ?? '',
      items: initialData?.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })) ?? defaultItems ?? [],
    })
  }

  useEffect(() => {
    if (open) resetForm()
  }, [open, initialData, supplier, defaultItems, defaultNotes])

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const items = form.watch('items')

  const subTotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)

  const tax = subTotal * 0.18
  const total = subTotal + tax

  const onSelectProduct = useCallback((product: Product) => {
    const exists = form.getValues('items').some((i) => i.productId === product.id)
    if (exists) {
      toast.info('El producto ya está agregado')
      return
    }
    append({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.costPrice ?? 0,
    })
  }, [append, form])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        supplierId: data.supplierId,
        expectedDate: data.expectedDate || null,
        notes: data.notes || null,
        items: data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      }
      await onSave!(payload)
      toast.success(isEdit ? 'Orden actualizada' : 'Orden de compra creada')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `No se pudo ${isEdit ? 'actualizar' : 'crear'} la orden`)
    } finally {
      setSaving(false)
    }
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar orden de compra' : 'Nueva orden de compra'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Actualiza los datos de la orden de compra.' : 'Complete los datos para generar una orden de compra.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isEdit || !!supplier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {(suppliers ?? []).map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.businessName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PEN">Soles (PEN)</SelectItem>
                          <SelectItem value="USD">Dólares (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de emisión</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha esperada</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condiciones de pago</FormLabel>
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contado">Contado</SelectItem>
                            <SelectItem value="credito-15">Crédito 15 días</SelectItem>
                            <SelectItem value="credito-30">Crédito 30 días</SelectItem>
                            <SelectItem value="credito-60">Crédito 60 días</SelectItem>
                            <SelectItem value="credito-90">Crédito 90 días</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Productos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setProductSearchOpen(true)}>
                    <Search className="size-3.5 mr-1" /> Agregar producto
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    No hay productos agregados. Busque y seleccione productos para agregar.
                  </p>
                ) : (
                  <div className="overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[180px]">Producto</TableHead>
                          <TableHead className="w-24 text-right">Cantidad</TableHead>
                          <TableHead className="w-28 text-right">Precio unit.</TableHead>
                          <TableHead className="w-28 text-right">Subtotal</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => {
                          const product = productMap.get(field.productId)
                          return (
                            <TableRow key={field.id}>
                              <TableCell className="font-medium">
                                {field.productName}
                                {product?.sku && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="any"
                                  min="0.01"
                                  className="h-8 w-20 text-right ml-auto tabular-nums"
                                  {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="any"
                                  min="0"
                                  className="h-8 w-24 text-right ml-auto tabular-nums"
                                  {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                />
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-sm">
                                S/ {(Number(items[index]?.quantity || 0) * Number(items[index]?.unitPrice || 0)).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => remove(index)}>
                                  <Trash2 className="size-3.5 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">S/ {subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGV (18%)</span>
                  <span className="tabular-nums">S/ {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas / Observaciones</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notas adicionales..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar orden'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProductSearchDialog
        open={productSearchOpen}
        onOpenChange={setProductSearchOpen}
        onSelect={onSelectProduct}
      />
    </>
  )
}
