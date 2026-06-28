import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Pencil, Power } from 'lucide-react'
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
}

export function getUserColumns({
  pending,
  onEdit,
  onDeactivate,
  onReactivate,
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
              <Button
                variant="ghost"
                size="icon-sm"
                title="Editar"
                onClick={() => onEdit(user)}
              >
                <Pencil className="text-amber-500" />
                <span className="sr-only">Editar</span>
              </Button>
            </Can>
            <Can permission="iam.users.update">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                title={isActive ? 'Desactivar' : 'Reactivar'}
                onClick={() => (isActive ? onDeactivate(user) : onReactivate(user))}
              >
                {isActive ? (
                  <Ban className="text-destructive" />
                ) : (
                  <Power className="text-success" />
                )}
                <span className="sr-only">{isActive ? 'Desactivar' : 'Reactivar'}</span>
              </Button>
            </Can>
          </div>
        )
      },
    },
  ]
}
