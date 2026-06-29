import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Pencil, Power } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Currency } from '../types/erp'

interface Options {
  pending: boolean
  onEdit: (item: Currency) => void
  onToggleStatus: (item: Currency) => void
}

export function getCurrencyColumns({ pending, onEdit, onToggleStatus }: Options): ColumnDef<Currency, unknown>[] {
  return [
    {
      id: 'code',
      accessorKey: 'code',
      header: 'Código',
      meta: { label: 'Código' },
      cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nombre',
      meta: { label: 'Nombre' },
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      id: 'symbol',
      accessorKey: 'symbol',
      header: 'Símbolo',
      meta: { label: 'Símbolo' },
      cell: ({ row }) => <span>{row.original.symbol ?? '—'}</span>,
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
        const item = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => onEdit(item)}>
              <Pencil className="text-amber-500" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              title={item.isActive ? 'Desactivar' : 'Activar'}
              onClick={() => onToggleStatus(item)}
            >
              {item.isActive ? <Ban className="text-destructive" /> : <Power className="text-success" />}
              <span className="sr-only">{item.isActive ? 'Desactivar' : 'Activar'}</span>
            </Button>
          </div>
        )
      },
    },
  ]
}
