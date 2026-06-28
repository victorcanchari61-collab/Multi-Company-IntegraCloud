import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Can } from '@/features/auth/components/Can'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useRoles, useUpdateRole, useDeleteRole } from '../queries/useRoles'
import { RoleFormDialog } from '../components/RoleFormDialog'
import { ApiError } from '@/lib/api'
import type { Role } from '../types/iam'

export default function RolesPage() {
  const companyId = useActiveCompanyId()

  if (!companyId)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Selecciona una empresa para administrar sus roles.
      </p>
    )

  return <RolesContent companyId={companyId} />
}

function RolesContent({ companyId }: { companyId: string }) {
  const navigate = useNavigate()
  const { data: roles, isLoading } = useRoles(companyId)
  const updateRole = useUpdateRole(companyId)
  const deleteRole = useDeleteRole(companyId)

  const [editTarget, setEditTarget] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const openEdit = (role: Role) => {
    setEditTarget(role)
    setEditName(role.name)
    setEditDesc(role.description ?? '')
  }

  const handleSaveEdit = () => {
    if (!editTarget) return
    updateRole.mutate(
      { roleId: editTarget.id, data: { name: editName, description: editDesc || null } },
      {
        onSuccess: () => {
          toast.success('Rol actualizado')
          setEditTarget(null)
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'Error al actualizar'),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteRole.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Rol eliminado')
        setDeleteTarget(null)
      },
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'Error al eliminar'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Roles de tu empresa y los permisos que agrupan.
          </p>
        </div>
        <Can permission="iam.roles.create">
          <RoleFormDialog companyId={companyId} />
        </Can>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : roles && roles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-40 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow
                key={role.id}
                className="cursor-pointer"
                onClick={() => navigate({ to: '/iam/roles/$roleId', params: { roleId: role.id } } as any)}
              >
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {role.description ?? '\u2014'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Can permission="iam.roles.view">
                      <Button
                        variant="ghost"
                        size="sm"
                      onClick={() =>
                        navigate({ to: '/iam/roles/$roleId', params: { roleId: role.id } } as any)
                      }
                      >
                        <Eye className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="iam.roles.update">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="iam.roles.delete">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(role)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay roles. Crea el primero.
        </p>
      )}

      <Dialog open={editTarget !== null} onOpenChange={(o) => !o && setEditTarget(null)}>
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
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateRole.isPending || !editName.trim()}>
              {updateRole.isPending ? 'Guardando\u2026' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar rol</DialogTitle>
            <DialogDescription>
              Esta acci&oacute;n no se puede deshacer. El rol &ldquo;{deleteTarget?.name}&rdquo; ser&aacute;
              eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              onClick={() => setDeleteTarget(null)}
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
