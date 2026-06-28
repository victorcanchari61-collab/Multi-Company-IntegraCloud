import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Pencil, Power } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UnitOfMeasure } from '../types/erp'

interface Options {
  pending: boolean
  onEdit: (unit: UnitOfMeasure) => void
  onToggleStatus: (unit: UnitOfMeasure) => void
}

export function getUnitColumns({ pending, onEdit, onToggleStatus }: Options): ColumnDef<
  UnitOfMeasure,
  unknown
>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nombre',
      meta: { label: 'Nombre' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'abbreviation',
      accessorKey: 'abbreviation',
      header: 'Abreviatura',
      meta: { label: 'Abreviatura' },
      cell: ({ row }) => <span>{row.original.abbreviation}</span>,
    },
    {
      id: 'status',
      accessorKey: 'isActive',
      header: 'Estado',
      meta: { label: 'Estado' },
      cell: ({ row }) => (
        <Badge
          className={cn(
            'border-transparent',
            row.original.isActive
              ? 'bg-success text-success-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      enableHiding: false,
      meta: { label: 'Acciones' },
      cell: ({ row }) => {
        const unit = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => onEdit(unit)}>
              <Pencil className="text-amber-500" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              title={unit.isActive ? 'Desactivar' : 'Activar'}
              onClick={() => onToggleStatus(unit)}
            >
              {unit.isActive ? (
                <Ban className="text-destructive" />
              ) : (
                <Power className="text-success" />
              )}
              <span className="sr-only">{unit.isActive ? 'Desactivar' : 'Activar'}</span>
            </Button>
          </div>
        )
      },
    },
  ]
}
