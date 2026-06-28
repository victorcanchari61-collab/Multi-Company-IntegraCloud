import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Can } from '@/features/auth/components/Can'
import { Pencil, Trash2 } from 'lucide-react'
import type { Role } from '../types/iam'

interface Options {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function getRoleColumns({
  onEdit,
  onDelete,
}: Options): ColumnDef<Role, unknown>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Rol',
      meta: { label: 'Rol', hideOnMobile: true },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Descripción',
      meta: { label: 'Descripción' },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description ?? '\u2014'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      enableHiding: false,
      meta: { label: 'Acciones' },
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex justify-end gap-1">
            <Can permission="iam.roles.update">
              <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                <Pencil className="size-4" />
              </Button>
            </Can>
            <Can permission="iam.roles.delete">
              <Button variant="ghost" size="sm" onClick={() => onDelete(role)}>
                <Trash2 className="size-4" />
              </Button>
            </Can>
          </div>
        )
      },
    },
  ]
}
