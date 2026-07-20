import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Can } from '@/features/auth/components/Can'
import { Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import type { Role } from '../types/iam'

interface Options {
  onPermissions: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function getRoleColumns({
  onPermissions,
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
            <Can permission="iam.roles.assign_permissions">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Permisos"
                onClick={() => onPermissions(role)}
              >
                <ShieldCheck className="text-primary" />
                <span className="sr-only">Permisos</span>
              </Button>
            </Can>
            <Can permission="iam.roles.update">
              <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => onEdit(role)}>
                <Pencil className="size-4 text-amber-500" />
                <span className="sr-only">Editar</span>
              </Button>
            </Can>
            <Can permission="iam.roles.delete">
              <Button variant="ghost" size="icon-sm" title="Eliminar" onClick={() => onDelete(role)}>
                <Trash2 className="size-4 text-destructive" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </Can>
          </div>
        )
      },
    },
  ]
}
