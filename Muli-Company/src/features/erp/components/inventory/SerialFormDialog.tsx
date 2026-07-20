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
import type { ProductLot } from '../../types/erp'

const schema = z.object({
  serial: z.string().min(1, 'El número de serie es requerido').max(100),
  batchId: z.string().nullable().optional(),
  warehouseId: z.string().min(1, 'El almacén es requerido'),
  locationId: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  lots: ProductLot[]
  onSave: (data: { productId: string; serial: string; batchId?: string | null; warehouseId: string; locationId?: string | null }) => void
  saving: boolean
}

export function SerialFormDialog({ open, onOpenChange, productId, lots, onSave, saving }: Props) {
  const { data: warehouses } = useWarehouses()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { serial: '', batchId: '', warehouseId: '', locationId: '' },
  })

  useEffect(() => {
    form.reset({ serial: '', batchId: '', warehouseId: '', locationId: '' })
  }, [open, form])

  const onSubmit = (values: FormValues) => {
    onSave({
      productId,
      serial: values.serial,
      batchId: values.batchId || null,
      warehouseId: values.warehouseId,
      locationId: values.locationId || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar número de serie</DialogTitle>
          <DialogDescription>Registra un nuevo número de serie para el producto.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="serial" render={({ field }) => (
              <FormItem>
                <FormLabel>Número de serie</FormLabel>
                <FormControl><Input placeholder="SN-001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="batchId" render={({ field }) => (
              <FormItem>
                <FormLabel>Lote</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sin lote" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=" ">Sin lote</SelectItem>
                    {lots.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.number}</SelectItem>
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
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Registrar serie'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
