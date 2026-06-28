import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import type { User } from '../types/iam'
import { StatusBadge } from './StatusBadge'

interface Options {
  pending: boolean
  onEdit: (user: User) => void
  onDeactivate: (user: User) => void
  onReactivate: (user: User) => void
  onAssignRoles: (user: User) => void
  onChangePassword: (user: User) => void
}

export function getUserColumns({
  pending,
  onEdit,
  onDeactivate,
  onReactivate,
  onAssignRoles,
  onChangePassword,
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
      cell: ({ row }) => <span>{row.original.email}</span>,
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
        const isActive = user.status === ENTITY_STATUS.ACTIVE
        return (
          <div className="flex justify-end gap-1">
            <Can permission="iam.users.update">
              <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                <Pencil className="size-4" />
              </Button>
            </Can>
            <Can permission="iam.users.assign_roles">
              <Button variant="outline" size="sm" onClick={() => onAssignRoles(user)}>
                Roles
              </Button>
            </Can>
            <Can permission="iam.users.update">
              {isActive ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => onDeactivate(user)}
                >
                  Desactivar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => onReactivate(user)}
                >
                  Reactivar
                </Button>
              )}
            </Can>
            <Can permission="iam.users.update">
              <Button variant="ghost" size="sm" onClick={() => onChangePassword(user)}>
                Password
              </Button>
            </Can>
          </div>
        )
      },
    },
  ]
}
