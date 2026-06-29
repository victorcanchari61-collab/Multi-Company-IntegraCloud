import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Pencil, Power } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PriceList } from '../types/erp'

interface Options {
  pending: boolean
  onEdit: (item: PriceList) => void
  onToggleStatus: (item: PriceList) => void
}

export function getPriceListColumns({ pending, onEdit, onToggleStatus }: Options): ColumnDef<PriceList, unknown>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nombre',
      meta: { label: 'Nombre' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Descripción',
      meta: { label: 'Descripción' },
      cell: ({ row }) => <span>{row.original.description ?? '—'}</span>,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Tipo',
      meta: { label: 'Tipo' },
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type === 'purchase' ? 'Compra' : row.original.type === 'sale' ? 'Venta' : 'Ambos'}
        </Badge>
      ),
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
