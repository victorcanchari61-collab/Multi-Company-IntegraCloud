import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ApiError } from '@/lib/api'
import { useCreateUnit, useUpdateUnit } from '../queries/useUnits'
import type { UnitOfMeasure } from '../types/erp'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(60),
  abbreviation: z.string().min(1, 'La abreviatura es requerida').max(10),
})

type FormData = z.infer<typeof schema>

interface Props {
  unit?: UnitOfMeasure
  onClose?: () => void
}

export function UnitFormDialog({ unit, onClose }: Props = {}) {
  const isEdit = Boolean(unit)
  const [open, setOpen] = useState(false)
  const createMut = useCreateUnit()
  const updateMut = useUpdateUnit()
  const isPending = createMut.isPending || updateMut.isPending

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: unit?.name ?? '', abbreviation: unit?.abbreviation ?? '' },
  })

  const onSubmit = (data: FormData) => {
    const payload = { name: data.name.trim(), abbreviation: data.abbreviation.trim() }
    const onError = (error: unknown) =>
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar la unidad')

    if (isEdit && unit) {
      updateMut.mutate(
        { id: unit.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Unidad actualizada')
            onClose?.()
          },
          onError,
        },
      )
      return
    }

    createMut.mutate(payload, {
      onSuccess: () => {
        toast.success('Unidad creada')
        form.reset()
        setOpen(false)
      },
      onError,
    })
  }

  return (
    <>
      {!isEdit && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nueva unidad
        </Button>
      )}
      <Dialog
        open={isEdit ? true : open}
        onOpenChange={isEdit ? (o) => !o && onClose?.() : setOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar unidad' : 'Nueva unidad de medida'}</DialogTitle>
            <DialogDescription>
              Define una unidad de medida del catálogo (ej: UND, KG, LT, MT).
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Metro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="abbreviation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abreviatura</FormLabel>
                    <FormControl>
                      <Input placeholder="MT" maxLength={10} {...field} />
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
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear unidad'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
