import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError } from '@/lib/api'
import { Can } from '@/features/auth/components/Can'
import { DataTable } from '@/components/data-table/DataTable'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useRoles, useDeleteRole } from '../queries/useRoles'
import { getRoleColumns } from '../components/roles.columns'
import { RoleFormDialog } from '../components/RoleFormDialog'
import { RolePermissionsDialog } from '../components/RolePermissionsDialog'
import type { Role } from '../types/iam'

export default function RolesPage() {
  const companyId = useActiveCompanyId()
  const [editTarget, setEditTarget] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [search, setSearch] = useState('')

  if (!companyId)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Selecciona una empresa para administrar sus roles.
      </p>
    )

  return (
    <RolesContent
      companyId={companyId}
      editTarget={editTarget}
      setEditTarget={setEditTarget}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      search={search}
      setSearch={setSearch}
    />
  )
}

function RolesContent({
  companyId,
  editTarget,
  setEditTarget,
  deleteTarget,
  setDeleteTarget,
  search,
  setSearch,
}: {
  companyId: string
  editTarget: Role | null
  setEditTarget: (role: Role | null) => void
  deleteTarget: Role | null
  setDeleteTarget: (role: Role | null) => void
  search: string
  setSearch: (s: string) => void
}) {
  const { data: roles, isLoading } = useRoles(companyId)
  const deleteRole = useDeleteRole(companyId)
  const [permsTarget, setPermsTarget] = useState<Role | null>(null)

  const filtered = useMemo(() => {
    if (!roles) return []
    if (!search) return roles
    const q = search.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
    )
  }, [roles, search])

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

  const columns = useMemo(
    () =>
      getRoleColumns({
        onPermissions: setPermsTarget,
        onEdit: setEditTarget,
        onDelete: setDeleteTarget,
      }),
    [],
  )

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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripci&oacute;n..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch('')}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        onRowClick={(role) => setPermsTarget(role)}
        emptyMessage={
          search
            ? 'No hay roles que coincidan con la b&uacute;squeda.'
            : 'No hay roles. Crea el primero.'
        }
      />

      {editTarget && (
        <RoleFormDialog
          companyId={companyId}
          role={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

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
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending ? 'Eliminando\u2026' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RolePermissionsDialog
        companyId={companyId}
        role={permsTarget}
        onClose={() => setPermsTarget(null)}
      />
    </div>
  )
}
