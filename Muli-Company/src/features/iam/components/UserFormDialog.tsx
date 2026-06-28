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
import { useCreateUser, useUpdateUser } from '../queries/useUsers'
import type { User } from '../types/iam'

const createSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido').max(150),
  email: z.string().min(1, 'El correo es requerido').email('Correo inv\u00e1lido'),
  password: z.string().min(8, 'M\u00ednimo 8 caracteres'),
})

const editSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido').max(150),
  email: z.string().min(1, 'El correo es requerido').email('Correo inv\u00e1lido'),
})

type CreateFormData = z.infer<typeof createSchema>
type EditFormData = z.infer<typeof editSchema>

interface Props {
  companyId: string
  user?: User
  onClose?: () => void
}

export function UserFormDialog({ companyId, user, onClose }: Props) {
  const isEdit = Boolean(user)
  const [open, setOpen] = useState(false)
  const createMut = useCreateUser(companyId)
  const updateMut = useUpdateUser(companyId)

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { fullName: user?.fullName ?? '', email: user?.email ?? '' },
  })

  const isPending = createMut.isPending || updateMut.isPending

  const onCreateSubmit = (data: CreateFormData) =>
    createMut.mutate(data, {
      onSuccess: () => {
        toast.success('Usuario creado')
        createForm.reset()
        setOpen(false)
      },
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'No se pudo crear el usuario'),
    })

  const onEditSubmit = (data: EditFormData) => {
    if (!user) return
    updateMut.mutate(
      { userId: user.id, data },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado')
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
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
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
        <Plus className="size-4" /> Nuevo usuario
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Crea un usuario dentro de tu empresa.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan P\u00e9rez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="juan@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrase\u00f1a temporal</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creando\u2026' : 'Crear usuario'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
