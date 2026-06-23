import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { Can } from '@/features/auth/components/Can'
import { DataTable } from '@/components/data-table/DataTable'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useUsers, useDeactivateUser } from '../queries/useUsers'
import { getUserColumns } from '../components/users.columns'
import { UserFormDialog } from '../components/UserFormDialog'
import { AssignRolesDialog } from '../components/AssignRolesDialog'
import type { User } from '../types/iam'

export default function UsersPage() {
  const companyId = useActiveCompanyId()
  const [rolesFor, setRolesFor] = useState<User | null>(null)

  if (!companyId)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Selecciona una empresa para administrar sus usuarios.
      </p>
    )

  return <UsersContent companyId={companyId} rolesFor={rolesFor} setRolesFor={setRolesFor} />
}

function UsersContent({
  companyId,
  rolesFor,
  setRolesFor,
}: {
  companyId: string
  rolesFor: User | null
  setRolesFor: (user: User | null) => void
}) {
  const { data, isLoading } = useUsers(companyId, { page: 1, size: 50 })
  const deactivate = useDeactivateUser(companyId)

  const onDeactivate = (user: User) =>
    deactivate.mutate(user.id, {
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'No se pudo desactivar'),
    })

  const columns = useMemo(
    () =>
      getUserColumns({
        pending: deactivate.isPending,
        onDeactivate,
        onAssignRoles: setRolesFor,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deactivate.isPending],
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

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        getRowId={(u) => u.id}
        mobileTitle={(u) => u.fullName}
        emptyMessage="No hay usuarios en esta empresa."
      />

      <AssignRolesDialog
        companyId={companyId}
        user={rolesFor}
        onClose={() => setRolesFor(null)}
      />
    </div>
  )
}
