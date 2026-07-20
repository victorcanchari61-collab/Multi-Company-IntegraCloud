import { useEffect, useState } from 'react'
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
import { ProductSearchDialog } from '../ProductSearchDialog'
import type { CreatePurchaseRequestRequest, PurchaseRequestDto } from '../../services/purchases.service'
import type { Product } from '../../types/erp'

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Requerido'),
  productName: z.string(),
  quantity: z.number().positive('Debe ser mayor a 0'),
  description: z.string().optional(),
  estimatedPrice: z.number().min(0, 'Debe ser 0 o mayor').optional(),
})

const schema = z.object({
  requesterName: z.string().min(1, 'El solicitante es requerido').max(200),
  department: z.string().max(200).optional(),
  supplierId: z.string().optional(),
  priority: z.string().optional(),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'Agregue al menos un producto'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreatePurchaseRequestRequest) => Promise<unknown>
  initialData?: PurchaseRequestDto
}

export function PurchaseRequestFormDialog({ open, onOpenChange, onSave, initialData }: Props) {
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialData
  const { data: suppliers } = useSuppliers()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      requesterName: '',
      department: '',
      supplierId: '',
      priority: '',
      expectedDate: '',
      notes: '',
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  const resetForm = () => {
    form.reset({
      requesterName: initialData?.requesterName ?? '',
      department: initialData?.department ?? '',
      supplierId: initialData?.supplierId ?? '',
      priority: initialData?.priority ?? '',
      expectedDate: initialData?.expectedDate ? initialData.expectedDate.slice(0, 10) : '',
      notes: initialData?.notes ?? '',
      items: initialData?.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        description: i.description ?? '',
        estimatedPrice: i.estimatedPrice ?? undefined,
      })) ?? [],
    })
  }

  useEffect(() => {
    if (open) resetForm()
  }, [open, initialData])

  const onSelectProduct = (product: Product) => {
    const exists = form.getValues('items').some((i) => i.productId === product.id)
    if (exists) { toast.info('El producto ya está agregado'); return }
    append({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      description: '',
      estimatedPrice: undefined,
    })
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        requesterName: data.requesterName,
        department: data.department || null,
        supplierId: data.supplierId || null,
        priority: data.priority || null,
        expectedDate: data.expectedDate || null,
        notes: data.notes || null,
        items: data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          description: i.description || null,
          estimatedPrice: typeof i.estimatedPrice === 'number' ? i.estimatedPrice : null,
        })),
      } satisfies CreatePurchaseRequestRequest
      await onSave(payload)
      toast.success(isEdit ? 'Solicitud actualizada' : 'Solicitud creada')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `No se pudo ${isEdit ? 'actualizar' : 'crear'} la solicitud`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar solicitud' : 'Nueva solicitud de compra'}</DialogTitle>
            <DialogDescription>{isEdit ? 'Actualiza los datos de la solicitud.' : 'Registra una nueva solicitud de compra.'}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requesterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitante *</FormLabel>
                      <FormControl><Input placeholder="Nombre del solicitante" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl><Input placeholder="Ej: Logística" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                        <SelectContent>
                          {(suppliers ?? []).map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.businessName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha esperada</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Productos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setProductSearchOpen(true)}>
                    <Search className="size-3.5 mr-1" /> Agregar producto
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    No hay productos agregados.
                  </p>
                ) : (
                  <div className="overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[180px]">Producto</TableHead>
                          <TableHead className="w-20 text-right">Cantidad</TableHead>
                          <TableHead className="w-28 text-right">Precio est.</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.productName}</TableCell>
                            <TableCell className="text-right">
                              <Input type="number" step="any" min="0.01" className="h-8 w-20 text-right ml-auto tabular-nums"
                                {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input type="number" step="any" min="0" className="h-8 w-24 text-right ml-auto tabular-nums"
                                {...form.register(`items.${index}.estimatedPrice`, { valueAsNumber: true })} />
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => remove(index)}>
                                <Trash2 className="size-3.5 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl><Textarea placeholder="Notas adicionales..." rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar solicitud'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProductSearchDialog open={productSearchOpen} onOpenChange={setProductSearchOpen} onSelect={onSelectProduct} />
    </>
  )
}
