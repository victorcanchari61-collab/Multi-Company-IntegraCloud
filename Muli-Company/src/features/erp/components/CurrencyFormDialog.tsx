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
import type { Currency } from '../types/erp'

const schema = z.object({
  code: z.string().min(1, 'El código es requerido').max(3),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  symbol: z.string().max(5).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  currency?: Currency | null
  onClose?: () => void
  onCreate: (data: FormData) => Promise<unknown>
  onUpdate: (id: string, data: FormData) => Promise<unknown>
}

export function CurrencyFormDialog({ currency, onClose, onCreate, onUpdate }: Props) {
  const isEdit = Boolean(currency)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: currency?.code ?? '',
      name: currency?.name ?? '',
      symbol: currency?.symbol ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = { code: data.code.trim().toUpperCase(), name: data.name.trim(), symbol: data.symbol?.trim() || undefined }
      if (isEdit && currency) {
        await onUpdate(currency.id, payload)
        toast.success('Moneda actualizada')
        onClose?.()
      } else {
        await onCreate(payload)
        toast.success('Moneda creada')
        form.reset()
        setOpen(false)
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {!isEdit && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nueva moneda
        </Button>
      )}
      <Dialog
        open={isEdit ? true : open}
        onOpenChange={isEdit ? (o) => !o && onClose?.() : setOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar moneda' : 'Nueva moneda'}</DialogTitle>
            <DialogDescription>Registra una moneda para precios de productos.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="PEN" maxLength={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Sol peruano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Símbolo</FormLabel>
                    <FormControl>
                      <Input placeholder="S/" maxLength={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                {isEdit && (
                  <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
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
