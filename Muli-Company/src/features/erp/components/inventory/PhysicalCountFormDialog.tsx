import { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWarehouses } from '../../queries/useInventory'

const schema = z.object({
  warehouseId: z.string().min(1, 'El almacén es requerido'),
  notes: z.string().max(500).nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { warehouseId: string; notes?: string | null }) => void
  saving: boolean
}

export function PhysicalCountFormDialog({ open, onOpenChange, onSave, saving }: Props) {
  const { data: warehouses } = useWarehouses()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { warehouseId: '', notes: '' },
  })

  useEffect(() => {
    form.reset({ warehouseId: '', notes: '' })
  }, [open, form])

  const onSubmit = (values: FormValues) => {
    onSave({ warehouseId: values.warehouseId, notes: values.notes || null })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo conteo físico</DialogTitle>
          <DialogDescription>Crea un conteo físico. Las líneas se auto-poblarán con el stock actual del almacén.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl><Input placeholder="Notas opcionales" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creando…' : 'Crear conteo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
