import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { Can } from '@/features/auth/components/Can'
import { DataTable } from '@/components/data-table/DataTable'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useUsers, useDeactivateUser, useReactivateUser } from '../queries/useUsers'
import { getUserColumns } from '../components/users.columns'
import { UserFormDialog } from '../components/UserFormDialog'
import { AssignRolesDialog } from '../components/AssignRolesDialog'
import { ChangePasswordDialog } from '../components/ChangePasswordDialog'
import type { User } from '../types/iam'

export default function UsersPage() {
  const companyId = useActiveCompanyId()
  const [rolesFor, setRolesFor] = useState<User | null>(null)
  const [passwordFor, setPasswordFor] = useState<User | null>(null)
  const [search, setSearch] = useState('')

  if (!companyId)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Selecciona una empresa para administrar sus usuarios.
      </p>
    )

  return (
    <UsersContent
      companyId={companyId}
      rolesFor={rolesFor}
      setRolesFor={setRolesFor}
      passwordFor={passwordFor}
      setPasswordFor={setPasswordFor}
      search={search}
      setSearch={setSearch}
    />
  )
}

function UsersContent({
  companyId,
  rolesFor,
  setRolesFor,
  passwordFor,
  setPasswordFor,
  search,
  setSearch,
}: {
  companyId: string
  rolesFor: User | null
  setRolesFor: (user: User | null) => void
  passwordFor: User | null
  setPasswordFor: (user: User | null) => void
  search: string
  setSearch: (s: string) => void
}) {
  const { data, isLoading } = useUsers(companyId, { page: 1, size: 50, search: search || undefined })
  const deactivate = useDeactivateUser(companyId)
  const reactivate = useReactivateUser(companyId)

  const onDeactivate = (user: User) =>
    deactivate.mutate(user.id, {
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'No se pudo desactivar'),
    })

  const onReactivate = (user: User) =>
    reactivate.mutate(user.id, {
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'No se pudo reactivar'),
    })

  const columns = useMemo(
    () =>
      getUserColumns({
        pending: deactivate.isPending || reactivate.isPending,
        onDeactivate,
        onReactivate,
        onAssignRoles: setRolesFor,
        onChangePassword: setPasswordFor,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deactivate.isPending, reactivate.isPending],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Usuarios de tu empresa y sus roles.</p>
        </div>
        <Can permission="iam.users.create">
          <UserFormDialog companyId={companyId} />
        </Can>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o correo..."
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
        data={data?.items ?? []}
        loading={isLoading}
        getRowId={(u) => u.id}
        mobileTitle={(u) => u.fullName}
        emptyMessage={
          search ? 'No hay usuarios que coincidan con la búsqueda.' : 'No hay usuarios en esta empresa.'
        }
      />

      <AssignRolesDialog
        companyId={companyId}
        user={rolesFor}
        onClose={() => setRolesFor(null)}
      />

      <ChangePasswordDialog
        companyId={companyId}
        user={passwordFor}
        onClose={() => setPasswordFor(null)}
      />
    </div>
  )
}
