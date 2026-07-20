import { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWarehouses } from '../../queries/useInventory'
import { useProducts } from '../../queries/useProducts'

const schema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  warehouseId: z.string().min(1, 'El almacén es requerido'),
  quantity: z.string().min(1, 'La cantidad es requerida').refine((v) => Number(v) > 0, 'La cantidad debe ser mayor a 0'),
  referenceType: z.string().max(50).nullable().optional(),
  referenceId: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { productId: string; warehouseId: string; quantity: number; referenceType?: string | null; referenceId?: string | null; notes?: string | null }) => void
  saving: boolean
}

export function ReservationFormDialog({ open, onOpenChange, onSave, saving }: Props) {
  const { data: warehouses } = useWarehouses()
  const { data: products } = useProducts()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: '', warehouseId: '', quantity: '1', referenceType: '', referenceId: '', notes: '' },
  })

  useEffect(() => {
    form.reset({ productId: '', warehouseId: '', quantity: '1', referenceType: '', referenceId: '', notes: '' })
  }, [open, form])

  const onSubmit = (values: FormValues) => {
    onSave({
      productId: values.productId,
      warehouseId: values.warehouseId,
      quantity: Number(values.quantity),
      referenceType: values.referenceType || null,
      referenceId: values.referenceId || null,
      notes: values.notes || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva reserva de stock</DialogTitle>
          <DialogDescription>Reserva existencias para una orden o referencia.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="productId" render={({ field }) => (
              <FormItem>
                <FormLabel>Producto</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="warehouseId" render={({ field }) => (
              <FormItem>
                <FormLabel>Almacén</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Seleccionar almacén" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses?.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl><Input type="number" step="any" min="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="referenceType" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de referencia</FormLabel>
                <FormControl><Input placeholder="VENTA, PEDIDO, etc." {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl><Input placeholder="Notas opcionales" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Crear reserva'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
