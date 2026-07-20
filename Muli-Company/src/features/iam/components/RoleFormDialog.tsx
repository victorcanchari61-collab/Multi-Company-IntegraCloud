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
import { ApiError } from '@/lib/api'
import { useCreateRole, useUpdateRole } from '../queries/useRoles'
import type { Role } from '../types/iam'

const createSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80),
  description: z.string().max(255).optional(),
})

const editSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80),
  description: z.string().max(255).optional(),
})

type CreateFormData = z.infer<typeof createSchema>
type EditFormData = z.infer<typeof editSchema>

interface Props {
  companyId: string
  role?: Role
  onClose?: () => void
}

export function RoleFormDialog({ companyId, role, onClose }: Props) {
  const isEdit = Boolean(role)
  const [open, setOpen] = useState(false)
  const createMut = useCreateRole(companyId)
  const updateMut = useUpdateRole(companyId)

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', description: '' },
  })

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: role?.name ?? '', description: role?.description ?? '' },
  })

  const isPending = createMut.isPending || updateMut.isPending

  const onCreateSubmit = (data: CreateFormData) =>
    createMut.mutate(
      { name: data.name, description: data.description?.trim() || null },
      {
        onSuccess: () => {
          toast.success('Rol creado')
          createForm.reset()
          setOpen(false)
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo crear el rol'),
      },
    )

  const onEditSubmit = (data: EditFormData) => {
    if (!role) return
    updateMut.mutate(
      { roleId: role.id, data: { name: data.name, description: data.description?.trim() || null } },
      {
        onSuccess: () => {
          toast.success('Rol actualizado')
          onClose?.()
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar'),
      },
    )
  }

  if (isEdit) {
    return (
      <Dialog open={true} onOpenChange={(o) => !o && onClose?.()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar rol</DialogTitle>
            <DialogDescription>Actualiza el nombre y descripci&oacute;n del rol.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descripci&oacute;n <span className="text-muted-foreground">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !editForm.watch('name')?.trim()}>
                  {isPending ? 'Guardando\u2026' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Nuevo rol
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo rol</DialogTitle>
            <DialogDescription>Define un rol para tu empresa.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descripci&oacute;n <span className="text-muted-foreground">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creando\u2026' : 'Crear rol'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
