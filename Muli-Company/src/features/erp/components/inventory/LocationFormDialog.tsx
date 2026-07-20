import { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { LocationDto } from '../../services/inventory.service'

const schema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50),
  description: z.string().max(255).nullable().optional(),
  zone: z.string().max(50).nullable().optional(),
  parentId: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: LocationDto | null
  locations: LocationDto[]
  onSave: (data: { code: string; description?: string | null; zone?: string | null; parentId?: string | null }) => void
  saving: boolean
}

export function LocationFormDialog({ open, onOpenChange, editing, locations, onSave, saving }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', description: '', zone: '', parentId: '' },
  })

  useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code,
        description: editing.description ?? '',
        zone: editing.zone ?? '',
        parentId: editing.parentId ?? '',
      })
    } else {
      form.reset({ code: '', description: '', zone: '', parentId: '' })
    }
  }, [editing, open, form])

  const onSubmit = (values: FormValues) => {
    onSave({
      code: values.code,
      description: values.description || null,
      zone: values.zone || null,
      parentId: values.parentId || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar ubicación' : 'Nueva ubicación'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Modifica los datos de la ubicación.' : 'Registra una nueva ubicación en el almacén.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="code" render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl><Input placeholder="A-01-01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Input placeholder="Pasillo A, estante 1, nivel 1" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="zone" render={({ field }) => (
              <FormItem>
                <FormLabel>Zona</FormLabel>
                <FormControl><Input placeholder="Almacenamiento general" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="parentId" render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación padre</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Ninguna (raíz)" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=" ">Ninguna (raíz)</SelectItem>
                    {locations.filter(l => l.id !== editing?.id).map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.code} - {l.description ?? ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear ubicación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
