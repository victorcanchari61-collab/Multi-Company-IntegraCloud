import { useState } from 'react'
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

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(255).optional(),
})

type FormData = z.infer<typeof schema>

interface Entity {
  id: string
  name: string
  description?: string | null
}

interface Props<T extends Entity> {
  entity?: T | null
  onClose?: () => void
  onCreate: (data: { name: string; description?: string | null }) => Promise<unknown>
  onUpdate: (id: string, data: { name: string; description?: string | null }) => Promise<unknown>
  title: string
  description: string
  triggerLabel: string
  parentField?: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }
}

export function CatalogFormDialog<T extends Entity>({
  entity,
  onClose,
  onCreate,
  onUpdate,
  title,
  description,
  triggerLabel,
  parentField,
}: Props<T>) {
  const isEdit = Boolean(entity)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: entity?.name ?? '', description: entity?.description ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = { name: data.name.trim(), description: data.description?.trim() || null }
      if (isEdit && entity) {
        await onUpdate(entity.id, payload)
        toast.success(`${title} actualizado`)
        onClose?.()
      } else {
        await onCreate(payload)
        toast.success(`${title} creado`)
        form.reset()
        setOpen(false)
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `No se pudo guardar`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {!isEdit && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> {triggerLabel}
        </Button>
      )}
      <Dialog
        open={isEdit ? true : open}
        onOpenChange={isEdit ? (o) => !o && onClose?.() : setOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? `Editar ${title.toLowerCase()}` : `Nuevo ${title.toLowerCase()}`}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {parentField && (
                <div>
                  <FormLabel>{parentField.label}</FormLabel>
                  <Select value={parentField.value} onValueChange={(v) => parentField.onChange(v ?? '')}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${parentField.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {parentField.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descripción (opcional)" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
