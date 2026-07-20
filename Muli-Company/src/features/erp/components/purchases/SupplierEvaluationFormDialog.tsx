import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { useSuppliers } from '../../queries/usePurchases'
import { ApiError } from '@/lib/api'
import type { CreateSupplierEvaluationRequest, SupplierEvaluationDto } from '../../services/purchases.service'

const schema = z.object({
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  evaluationDate: z.string().min(1, 'La fecha es requerida'),
  score: z.number().min(0, 'Mínimo 0').max(5, 'Máximo 5'),
  evaluatedBy: z.string().min(1, 'El evaluador es requerido').max(200),
  priceRating: z.union([z.number(), z.nan(), z.literal('')]).optional(),
  qualityRating: z.union([z.number(), z.nan(), z.literal('')]).optional(),
  deliveryRating: z.union([z.number(), z.nan(), z.literal('')]).optional(),
  serviceRating: z.union([z.number(), z.nan(), z.literal('')]).optional(),
  comments: z.string().max(4000).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateSupplierEvaluationRequest) => Promise<unknown>
  initialData?: SupplierEvaluationDto
  defaultSupplierId?: string
  defaultOrderId?: string
}

export function SupplierEvaluationFormDialog({ open, onOpenChange, onSave, initialData, defaultSupplierId }: Props) {
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialData
  const { data: suppliers } = useSuppliers()

  const today = new Date().toISOString().split('T')[0]

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: defaultSupplierId ?? '',
      evaluationDate: today,
      score: 0,
      evaluatedBy: '',
      priceRating: undefined,
      qualityRating: undefined,
      deliveryRating: undefined,
      serviceRating: undefined,
      comments: '',
    },
  })

  const resetForm = () => {
    form.reset({
      supplierId: initialData?.supplierId ?? defaultSupplierId ?? '',
      evaluationDate: initialData?.evaluationDate ? initialData.evaluationDate.slice(0, 10) : today,
      score: initialData?.score ?? 0,
      evaluatedBy: initialData?.evaluatedBy ?? '',
      priceRating: initialData?.priceRating ?? undefined,
      qualityRating: initialData?.qualityRating ?? undefined,
      deliveryRating: initialData?.deliveryRating ?? undefined,
      serviceRating: initialData?.serviceRating ?? undefined,
      comments: initialData?.comments ?? '',
    })
  }

  useEffect(() => {
    if (open) resetForm()
  }, [open, initialData, defaultSupplierId])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        supplierId: data.supplierId,
        evaluationDate: data.evaluationDate ? `${data.evaluationDate}T00:00:00Z` : '',
        score: data.score,
        evaluatedBy: data.evaluatedBy,
        priceRating: typeof data.priceRating === 'number' ? data.priceRating : null,
        qualityRating: typeof data.qualityRating === 'number' ? data.qualityRating : null,
        deliveryRating: typeof data.deliveryRating === 'number' ? data.deliveryRating : null,
        serviceRating: typeof data.serviceRating === 'number' ? data.serviceRating : null,
        comments: data.comments || null,
      } satisfies CreateSupplierEvaluationRequest
      await onSave(payload)
      toast.success(isEdit ? 'Evaluación actualizada' : 'Evaluación creada')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `No se pudo ${isEdit ? 'actualizar' : 'crear'} la evaluación`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar evaluación' : 'Nueva evaluación'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Actualiza los datos de la evaluación.' : 'Registra una nueva evaluación de proveedor.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor *</FormLabel>
                  <Select value={field.value || ''} onValueChange={field.onChange} disabled={isEdit}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.businessName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="evaluationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de evaluación *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evaluatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluador *</FormLabel>
                    <FormControl><Input placeholder="Nombre del evaluador" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntaje general (0-5) *</FormLabel>
                  <Select
                    value={String(field.value ?? '')}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} / 5</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" placeholder="0-5"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qualityRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" placeholder="0-5"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrega</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" placeholder="0-5"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" placeholder="0-5"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios</FormLabel>
                  <FormControl><Textarea placeholder="Observaciones..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar evaluación'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
