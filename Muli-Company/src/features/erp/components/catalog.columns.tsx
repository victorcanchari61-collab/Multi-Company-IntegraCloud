import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NamedEntity {
  id: string
  name: string
  description?: string | null
  isActive: boolean
}

interface Options {
  onEdit: (item: NamedEntity) => void
}

function getNameColumn<T extends NamedEntity>(): ColumnDef<T, unknown> {
  return {
    id: 'name',
    accessorKey: 'name',
    header: 'Nombre',
    meta: { label: 'Nombre' },
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  }
}

function getDescriptionColumn<T extends NamedEntity>(): ColumnDef<T, unknown> {
  return {
    id: 'description',
    accessorKey: 'description',
    header: 'Descripción',
    meta: { label: 'Descripción' },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.description ?? '—'}</span>
    ),
  }
}

function getStatusColumn<T extends NamedEntity>(): ColumnDef<T, unknown> {
  return {
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
  }
}

function getActionsColumn<T extends NamedEntity>({ onEdit }: Options): ColumnDef<T, unknown> {
  return {
    id: 'actions',
    header: 'Acciones',
    enableHiding: false,
    meta: { label: 'Acciones' },
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => onEdit(row.original)}>
          <Pencil className="text-amber-500" />
          <span className="sr-only">Editar</span>
        </Button>
      </div>
    ),
  }
}

export function getCategoryColumns(opts: Options) {
  return [getNameColumn(), getDescriptionColumn(), getStatusColumn(), getActionsColumn(opts)]
}

export function getSubcategoryColumns(opts: Options) {
  const parentCol: ColumnDef<{ categoryName?: string } & NamedEntity, unknown> = {
    id: 'category',
    accessorKey: 'categoryName',
    header: 'Categoría',
    meta: { label: 'Categoría' },
    cell: ({ row }) => <span>{row.original.categoryName ?? '—'}</span>,
  }
  return [parentCol, getNameColumn(), getDescriptionColumn(), getStatusColumn(), getActionsColumn(opts)]
}

export function getBrandColumns(opts: Options) {
  return [getNameColumn(), getDescriptionColumn(), getStatusColumn(), getActionsColumn(opts)]
}

export function getSubbrandColumns(opts: Options) {
  const parentCol: ColumnDef<{ brandName?: string } & NamedEntity, unknown> = {
    id: 'brand',
    accessorKey: 'brandName',
    header: 'Marca',
    meta: { label: 'Marca' },
    cell: ({ row }) => <span>{row.original.brandName ?? '—'}</span>,
  }
  return [parentCol, getNameColumn(), getDescriptionColumn(), getStatusColumn(), getActionsColumn(opts)]
}

interface ProductEntity {
  id: string
  name: string
  sku?: string | null
  categoryName?: string | null
  brandName?: string | null
  salePrice?: number | null
  costPrice?: number | null
  isActive: boolean
}

export function getProductColumns(opts: Options) {
  const columns: ColumnDef<ProductEntity, unknown>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nombre',
      meta: { label: 'Nombre' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'sku',
      accessorKey: 'sku',
      header: 'SKU',
      meta: { label: 'SKU' },
      cell: ({ row }) => <span>{row.original.sku ?? '—'}</span>,
    },
    {
      id: 'category',
      accessorKey: 'categoryName',
      header: 'Categoría',
      meta: { label: 'Categoría' },
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.categoryName ?? '—'}</span>,
    },
    {
      id: 'brand',
      accessorKey: 'brandName',
      header: 'Marca',
      meta: { label: 'Marca' },
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.brandName ?? '—'}</span>,
    },
    {
      id: 'salePrice',
      accessorKey: 'salePrice',
      header: 'Precio venta',
      meta: { label: 'Precio venta' },
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.salePrice != null ? `S/ ${row.original.salePrice.toFixed(2)}` : '—'}
        </span>
      ),
    },
    getStatusColumn(),
    {
      id: 'actions',
      header: 'Acciones',
      enableHiding: false,
      meta: { label: 'Acciones' },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => opts.onEdit(row.original as unknown as NamedEntity)}>
            <Pencil className="text-amber-500" />
            <span className="sr-only">Editar</span>
          </Button>
        </div>
      ),
    },
  ]
  return columns
}
