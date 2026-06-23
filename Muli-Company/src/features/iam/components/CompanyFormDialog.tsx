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
import { useCreateCompany } from '../queries/useCompanies'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  legalName: z.string().max(200).optional(),
  taxId: z.string().max(20).optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  settlementCurrency: z.string().min(3, 'Código de 3 letras').max(3),
})

type FormData = z.infer<typeof schema>

const empty = (value?: string) => (value && value.trim() !== '' ? value.trim() : null)

export function CompanyFormDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useCreateCompany()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', legalName: '', taxId: '', email: '', settlementCurrency: 'PEN' },
  })

  const onSubmit = (data: FormData) => {
    mutate(
      {
        name: data.name,
        slug: data.slug,
        legalName: empty(data.legalName),
        taxId: empty(data.taxId),
        email: empty(data.email),
        settlementCurrency: data.settlementCurrency,
      },
      {
        onSuccess: () => {
          toast.success('Empresa creada')
          form.reset()
          setOpen(false)
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo crear la empresa'),
      },
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Nueva empresa
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva empresa</DialogTitle>
          <DialogDescription>Registra una empresa (tenant) en la plataforma.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi Empresa S.A.C." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="mi-empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="20123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settlementCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Input maxLength={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Correo <span className="text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contacto@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creando…' : 'Crear empresa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
