import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { WarehouseDto, CreateStockMovementRequest } from '../../services/inventory.service'

const schema = z.object({
  warehouseId: z.string().min(1, 'Selecciona un almacén'),
  productId: z.string().min(1, 'El ID del producto es requerido'),
  movementType: z.string().min(1, 'Selecciona un tipo de movimiento'),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unitCost: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

type FormValues = z.infer<typeof schema>

const MOVEMENT_TYPES = [
  { value: 'PURCHASE_IN', label: 'Compra (entrada)' },
  { value: 'SALE_OUT', label: 'Venta (salida)' },
  { value: 'ADJUSTMENT_POSITIVE', label: 'Ajuste positivo' },
  { value: 'ADJUSTMENT_NEGATIVE', label: 'Ajuste negativo' },
  { value: 'SALE_RETURN', label: 'Devolución de venta' },
  { value: 'PURCHASE_RETURN', label: 'Devolución de compra' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouses: WarehouseDto[]
  onSave: (data: CreateStockMovementRequest) => void
  saving: boolean
}

export function StockMovementFormDialog({ open, onOpenChange, warehouses, onSave, saving }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { warehouseId: '', productId: '', movementType: '', quantity: 0, unitCost: null, notes: '' },
  })

  const onSubmit = (values: FormValues) => {
    onSave({
      warehouseId: values.warehouseId,
      productId: values.productId,
      movementType: values.movementType,
      quantity: values.quantity,
      unitCost: values.unitCost ?? null,
      notes: values.notes || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo movimiento de stock</DialogTitle>
          <DialogDescription>
            Registra una entrada o salida de stock manualmente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="movementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de movimiento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOVEMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Almacén</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar almacén" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID del producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa el UUID del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo unitario (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Crear movimiento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
