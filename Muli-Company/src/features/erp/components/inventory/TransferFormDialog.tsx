import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWarehouses } from '../../queries/useInventory'
import { Plus, Trash2 } from 'lucide-react'
import type { CreateTransferRequest } from '../../services/inventory.service'

const itemSchema = z.object({
  productId: z.string().min(1, 'ID del producto requerido'),
  quantity: z.coerce.number().positive('Debe ser mayor a 0'),
  unitCost: z.coerce.number().min(0).nullable().optional(),
})

const schema = z.object({
  fromWarehouseId: z.string().min(1, 'Selecciona origen'),
  toWarehouseId: z.string().min(1, 'Selecciona destino'),
  notes: z.string().max(500).nullable().optional(),
  items: z.array(itemSchema).min(1, 'Agrega al menos un producto'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateTransferRequest) => void
  saving: boolean
}

export function TransferFormDialog({ open, onOpenChange, onSave, saving }: Props) {
  const { data: warehouses } = useWarehouses()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fromWarehouseId: '', toWarehouseId: '', notes: '', items: [] },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  const onSubmit = (values: FormValues) => {
    onSave({
      fromWarehouseId: values.fromWarehouseId,
      toWarehouseId: values.toWarehouseId,
      notes: values.notes || null,
      items: values.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost ?? null,
      })),
    })
  }

  const fromId = form.watch('fromWarehouseId')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva transferencia</DialogTitle>
          <DialogDescription>
            Transfiere productos entre almacenes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromWarehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén origen</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((w) => (
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
                name="toWarehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén destino</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses
                          ?.filter((w) => w.id !== fromId)
                          .map((w) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Productos</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: '', quantity: 0, unitCost: null })}
                >
                  <Plus className="size-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {fields.map((f, idx) => (
                <div key={f.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`items.${idx}.productId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="ID del producto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${idx}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input type="number" step="0.0001" min="0" placeholder="Cant." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${idx}.unitCost`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="Costo" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(idx)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.items?.message && (
                <p className="text-xs text-destructive">{form.formState.errors.items.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Crear transferencia'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
