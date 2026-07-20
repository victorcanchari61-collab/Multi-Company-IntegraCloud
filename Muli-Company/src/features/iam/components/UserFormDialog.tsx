import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useRoles } from '../queries/useRoles'
import { useAssignRolesToUser, useCreateUser, useUpdateUser, useUserById } from '../queries/useUsers'
import type { User } from '../types/iam'

const createSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido').max(150),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

const editSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido').max(150),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
})

type CreateFormData = z.infer<typeof createSchema>
type EditFormData = z.infer<typeof editSchema>

interface Props {
  companyId: string
  user?: User
  onClose?: () => void
}

function RolesField({
  companyId,
  selected,
  onToggle,
}: {
  companyId: string
  selected: Set<string>
  onToggle: (roleId: string, checked: boolean) => void
}) {
  const { data: roles, isLoading } = useRoles(companyId)
  return (
    <div className="space-y-2">
      <Label>Roles</Label>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : roles && roles.length > 0 ? (
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <Checkbox
                id={`role-${role.id}`}
                checked={selected.has(role.id)}
                onCheckedChange={(c) => onToggle(role.id, c === true)}
              />
              <Label htmlFor={`role-${role.id}`} className="font-normal">
                {role.name}
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No hay roles. Crea roles antes de asignarlos.
        </p>
      )}
    </div>
  )
}

export function UserFormDialog({ companyId, user, onClose }: Props) {
  const isEdit = Boolean(user)
  const [open, setOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())

  const createMut = useCreateUser(companyId)
  const updateMut = useUpdateUser(companyId)
  const assignMut = useAssignRolesToUser(companyId)

  // En edición, precarga los roles actuales del usuario.
  const { data: detail } = useUserById(companyId, isEdit ? (user?.id ?? '') : '')
  useEffect(() => {
    if (detail) setSelectedRoles(new Set(detail.roles.map((r) => r.roleId)))
  }, [detail])

  // En edición no se puede guardar hasta que los roles actuales estén cargados
  // (evita que un guardado prematuro borre los roles del usuario).
  const rolesReady = !isEdit || detail !== undefined

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { fullName: user?.fullName ?? '', email: user?.email ?? '' },
  })

  const isPending = createMut.isPending || updateMut.isPending || assignMut.isPending

  const toggleRole = (roleId: string, checked: boolean) =>
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (checked) next.add(roleId)
      else next.delete(roleId)
      return next
    })

  const fail = (error: unknown, fallback: string) =>
    toast.error(error instanceof ApiError ? error.message : fallback)

  const onCreateSubmit = (data: CreateFormData) => {
    createMut.mutate(data, {
      onSuccess: (newUserId) => {
        const roleIds = [...selectedRoles]
        const finish = () => {
          toast.success('Usuario creado')
          createForm.reset()
          setSelectedRoles(new Set())
          setOpen(false)
        }
        if (roleIds.length === 0) return finish()
        assignMut.mutate(
          { userId: newUserId, roleIds },
          {
            onSuccess: finish,
            onError: () => {
              toast.warning('Usuario creado, pero no se pudieron asignar los roles')
              createForm.reset()
              setSelectedRoles(new Set())
              setOpen(false)
            },
          },
        )
      },
      onError: (error) => fail(error, 'No se pudo crear el usuario'),
    })
  }

  const onEditSubmit = (data: EditFormData) => {
    if (!user) return
    updateMut.mutate(
      { userId: user.id, data },
      {
        onSuccess: () => {
          assignMut.mutate(
            { userId: user.id, roleIds: [...selectedRoles] },
            {
              onSuccess: () => {
                toast.success('Usuario actualizado')
                onClose?.()
              },
              onError: (error) => fail(error, 'Datos guardados, pero no se pudieron actualizar los roles'),
            },
          )
        },
        onError: (error) => fail(error, 'No se pudo actualizar'),
      },
    )
  }

  if (isEdit) {
    return (
      <Dialog open={true} onOpenChange={(o) => !o && onClose?.()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos y los roles del usuario.</DialogDescription>
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
              <RolesField companyId={companyId} selected={selectedRoles} onToggle={toggleRole} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !rolesReady}>
                  {isPending ? 'Guardando…' : !rolesReady ? 'Cargando…' : 'Guardar'}
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
            <DialogDescription>Crea un usuario, su contraseña y sus roles.</DialogDescription>
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
                      <Input placeholder="Juan Pérez" {...field} />
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
                    <FormLabel>Contraseña temporal</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <RolesField companyId={companyId} selected={selectedRoles} onToggle={toggleRole} />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creando…' : 'Crear usuario'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
