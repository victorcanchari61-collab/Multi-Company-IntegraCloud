import { useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Check, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { ApiError } from '@/lib/api'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useRoleById, useUpdateRole, useDeleteRole, useAssignPermissionsToRole } from '../queries/useRoles'
import { useAllPermissions } from '../queries/usePermissions'
import { Can } from '@/features/auth/components/Can'

export default function RoleDetailPage() {
  const { roleId } = useParams({ from: '/iam/roles/$roleId' as any })
  const companyId = useActiveCompanyId()
  const navigate = useNavigate()

  if (!companyId) return <p className="py-12 text-center text-sm text-muted-foreground">Selecciona una empresa.</p>

  return <RoleDetailContent companyId={companyId} roleId={roleId} navigate={navigate} />
}

function RoleDetailContent({
  companyId,
  roleId,
  navigate,
}: {
  companyId: string
  roleId: string
  navigate: ReturnType<typeof useNavigate>
}) {
  const { data: role, isLoading: loadingRole } = useRoleById(companyId, roleId)
  const { data: allPermissions, isLoading: loadingPerms } = useAllPermissions()
  const assignPerms = useAssignPermissionsToRole(companyId)
  const updateRole = useUpdateRole(companyId)
  const deleteRole = useDeleteRole(companyId)

  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const grantedPermissionIds = useMemo(
    () => new Set(role?.permissions.map((p) => p.id) ?? []),
    [role],
  )

  const togglePerm = useCallback((permId: string, checked: boolean) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (checked) next.add(permId)
      else next.delete(permId)
      return next
    })
  }, [])

  const handleSavePermissions = () => {
    assignPerms.mutate(
      { roleId, permissionIds: [...selectedPerms] },
      {
        onSuccess: () => {
          toast.success('Permisos actualizados')
          setSelectedPerms(new Set())
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'Error al guardar permisos'),
      },
    )
  }

  const handleEdit = () => {
    if (!role) return
    setEditName(role.name)
    setEditDesc(role.description ?? '')
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    updateRole.mutate(
      { roleId, data: { name: editName, description: editDesc || null } },
      {
        onSuccess: () => {
          toast.success('Rol actualizado')
          setEditOpen(false)
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'Error al actualizar rol'),
      },
    )
  }

  const handleDelete = () => {
    deleteRole.mutate(roleId, {
      onSuccess: () => {
        toast.success('Rol eliminado')
        navigate({ to: '/iam/roles' } as any)
      },
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'Error al eliminar rol'),
    })
  }

  if (loadingRole) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Rol no encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/iam/roles' } as any)}>
          Volver
        </Button>
      </div>
    )
  }

  const permsChanged =
    selectedPerms.size > 0 &&
    !([...selectedPerms].every((p) => grantedPermissionIds.has(p)) &&
      grantedPermissionIds.size === selectedPerms.size)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/iam/roles' } as any)}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{role.name}</h1>
              <Badge variant="outline">{role.permissions.length} permisos</Badge>
            </div>
            {role.description && (
              <p className="text-sm text-muted-foreground">{role.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Can permission="iam.roles.update">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="size-4 mr-1" /> Editar
            </Button>
          </Can>
          <Can permission="iam.roles.delete">
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4 mr-1" /> Eliminar
            </Button>
          </Can>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-medium">Permisos asignados</h2>
          <Can permission="iam.roles.assign_permissions">
            <Button
              size="sm"
              onClick={handleSavePermissions}
              disabled={assignPerms.isPending || !permsChanged}
            >
              {assignPerms.isPending ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Check className="size-4 mr-1" />
              )}
              Guardar permisos
            </Button>
          </Can>
        </div>

        {loadingPerms ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : allPermissions && allPermissions.length > 0 ? (
          <div className="divide-y">
            {allPermissions.map((perm) => {
              const isGranted = grantedPermissionIds.has(perm.id)
              const isSelected = selectedPerms.has(perm.id)
              const checked = isGranted || isSelected
              return (
                <label
                  key={perm.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => togglePerm(perm.id, c === true)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{perm.description}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{perm.key}</p>
                  </div>
                  {isGranted && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      Asignado
                    </Badge>
                  )}
                </label>
              )
            })}
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No hay permisos disponibles.</p>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar rol</DialogTitle>
            <DialogDescription>Actualiza el nombre y descripci&oacute;n del rol.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripci&oacute;n</Label>
              <Textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateRole.isPending || !editName.trim()}>
              {updateRole.isPending ? 'Guardando\u2026' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar rol</DialogTitle>
            <DialogDescription>
              Esta acci&oacute;n no se puede deshacer. El rol &ldquo;{role.name}&rdquo; ser&aacute; eliminado
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              onClick={handleDelete}
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending ? 'Eliminando\u2026' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
