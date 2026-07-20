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
import { ApiError } from '@/lib/api'
import type { CreateSupplierRequest, SupplierDto } from '../../services/purchases.service'

const schema = z.object({
  code: z.string().min(1, 'El RUC es requerido').max(20),
  businessName: z.string().min(1, 'La razón social es requerida').max(200),
  tradeName: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPerson: z.string().max(100).optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.union([z.number(), z.nan(), z.literal('')]).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateSupplierRequest) => Promise<unknown>
  initialData?: SupplierDto
}

export function SupplierFormDialog({ open, onOpenChange, onSave, initialData }: Props) {
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialData

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      businessName: '',
      tradeName: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
      paymentTerms: '',
      creditLimit: undefined,
    },
  })

  const resetForm = () => {
    form.reset({
      code: initialData?.code ?? '',
      businessName: initialData?.businessName ?? '',
      tradeName: initialData?.tradeName ?? '',
      address: initialData?.address ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      contactPerson: initialData?.contactPerson ?? '',
      paymentTerms: initialData?.paymentTerms ?? '',
      creditLimit: initialData?.creditLimit ?? undefined,
    })
  }

  useEffect(() => {
    if (open) resetForm()
  }, [open, initialData])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const creditLimit = typeof data.creditLimit === 'number' ? data.creditLimit : null
      const payload = {
        code: data.code,
        businessName: data.businessName,
        tradeName: data.tradeName || null,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        contactPerson: data.contactPerson || null,
        paymentTerms: data.paymentTerms || null,
        creditLimit,
      } satisfies CreateSupplierRequest
      await onSave(payload)
      toast.success(isEdit ? 'Proveedor actualizado' : 'Proveedor creado')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `No se pudo ${isEdit ? 'actualizar' : 'crear'} el proveedor`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Actualiza los datos del proveedor.' : 'Registra un nuevo proveedor en el sistema.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC *</FormLabel>
                    <FormControl>
                      <Input placeholder="20123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Distribuidora ABC S.A.C." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="Distribuidora ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Av. Principal 123" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ventas@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiciones de pago</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contado">Contado</SelectItem>
                        <SelectItem value="credito-15">Crédito 15 días</SelectItem>
                        <SelectItem value="credito-30">Crédito 30 días</SelectItem>
                        <SelectItem value="credito-60">Crédito 60 días</SelectItem>
                        <SelectItem value="credito-90">Crédito 90 días</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Línea de crédito (S/)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="any" placeholder="50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar proveedor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
