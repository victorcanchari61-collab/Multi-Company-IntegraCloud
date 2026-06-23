import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import type { User } from '../types/iam'
import { StatusBadge } from './StatusBadge'

interface Options {
  pending: boolean
  onDeactivate: (user: User) => void
  onAssignRoles: (user: User) => void
}

export function getUserColumns({
  pending,
  onDeactivate,
  onAssignRoles,
}: Options): ColumnDef<User, unknown>[] {
  return [
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: 'Usuario',
      meta: { label: 'Usuario', hideOnMobile: true },
      cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Correo',
      meta: { label: 'Correo' },
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Estado',
      meta: { label: 'Estado' },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      enableHiding: false,
      meta: { label: 'Acciones' },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end gap-2">
            <Can permission="iam.users.assign_roles">
              <Button variant="outline" size="sm" onClick={() => onAssignRoles(user)}>
                Roles
              </Button>
            </Can>
            <Can permission="iam.users.update">
              <Button
                variant="ghost"
                size="sm"
                disabled={pending || user.status !== ENTITY_STATUS.ACTIVE}
                onClick={() => onDeactivate(user)}
              >
                Desactivar
              </Button>
            </Can>
          </div>
        )
      },
    },
  ]
}
