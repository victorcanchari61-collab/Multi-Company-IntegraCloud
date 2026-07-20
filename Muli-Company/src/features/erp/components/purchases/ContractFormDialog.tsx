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
import type { CreatePurchaseContractRequest, PurchaseContractDto } from '../../services/purchases.service'

const schema = z.object({
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  contractNumber: z.string().min(1, 'El N° de contrato es requerido').max(50),
  title: z.string().min(1, 'El título es requerido').max(300),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  value: z.union([z.number(), z.nan(), z.literal('')]).optional(),
  terms: z.string().max(4000).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreatePurchaseContractRequest) => Promise<unknown>
  initialData?: PurchaseContractDto
}

export function ContractFormDialog({ open, onOpenChange, onSave, initialData }: Props) {
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialData
  const { data: suppliers } = useSuppliers()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: '',
      contractNumber: '',
      title: '',
      startDate: '',
      endDate: '',
      value: undefined,
      terms: '',
    },
  })

  const resetForm = () => {
    form.reset({
      supplierId: initialData?.supplierId ?? '',
      contractNumber: initialData?.contractNumber ?? '',
      title: initialData?.title ?? '',
      startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : '',
      endDate: initialData?.endDate ? initialData.endDate.slice(0, 10) : '',
      value: initialData?.value ?? undefined,
      terms: initialData?.terms ?? '',
    })
  }

  useEffect(() => {
    if (open) resetForm()
  }, [open, initialData])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const value = typeof data.value === 'number' ? data.value : null
      const payload = {
        supplierId: data.supplierId,
        contractNumber: data.contractNumber,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        value,
        terms: data.terms || null,
      } satisfies CreatePurchaseContractRequest
      await onSave(payload)
      toast.success(isEdit ? 'Contrato actualizado' : 'Contrato creado')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `No se pudo ${isEdit ? 'actualizar' : 'crear'} el contrato`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar contrato' : 'Nuevo contrato'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Actualiza los datos del contrato.' : 'Registra un nuevo contrato de compra.'}</DialogDescription>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.businessName}
                        </SelectItem>
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
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Contrato *</FormLabel>
                    <FormControl>
                      <Input placeholder="C-2024-001" {...field} disabled={isEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contrato de suministro anual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de fin *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (S/)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="50000"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Términos y condiciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cláusulas del contrato..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar contrato'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
