import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { useStockLowReorder, useSetStockLevels } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { StockLevelDialog } from '../../components/inventory/StockLevelDialog'
import { createColumnHelper } from '@tanstack/react-table'
import type { StockDto } from '../../services/inventory.service'

const lowCol = createColumnHelper<StockDto>()
const lowColumns = [
  lowCol.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  lowCol.accessor('productSku', { header: 'SKU', meta: { label: 'SKU' } }),
  lowCol.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  lowCol.accessor('quantity', {
    header: 'Stock actual',
    meta: { label: 'Stock actual' },
    cell: ({ getValue, row }) => (
      <span className={getValue() <= (row.original.minStock ?? 0) ? 'text-destructive font-medium' : ''}>
        {getValue()}
      </span>
    ),
  }),
  lowCol.accessor('minStock', { header: 'Mínimo', meta: { label: 'Mínimo' } }),
  lowCol.accessor('maxStock', { header: 'Máximo', meta: { label: 'Máximo' } }),
  lowCol.accessor('available', {
    header: 'Disponible',
    meta: { label: 'Disponible' },
    cell: ({ getValue }) => (
      <span className={getValue() <= 0 ? 'text-destructive font-medium' : ''}>
        {getValue()}
      </span>
    ),
  }),
]

export default function ReposicionPage() {
  const { data: lowStock, isLoading } = useStockLowReorder()
  const setLevels = useSetStockLevels()
  const [editing, setEditing] = useState<StockDto | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Niveles de reposición</h1>
        <p className="text-sm text-muted-foreground">
          Productos con stock por debajo del mínimo y control de niveles de reposición.
        </p>
      </div>

      {editing && (
        <StockLevelDialog
          open={!!editing}
          onOpenChange={(v) => { if (!v) setEditing(null) }}
          productName={editing.productName}
          currentMin={editing.minStock}
          currentMax={editing.maxStock}
          onSave={async (data) => {
            await setLevels.mutateAsync({ id: editing.id, data })
            setEditing(null)
          }}
          saving={setLevels.isPending}
        />
      )}

      <DataTable
        columns={[
          ...lowColumns,
          lowCol.display({
            id: 'actions',
            header: 'Acciones',
            meta: { label: 'Acciones' },
            cell: ({ row }) => (
              <Button variant="ghost" size="sm" onClick={() => setEditing(row.original)}>
                <Edit className="size-3" />
              </Button>
            ),
          }),
        ]}
        data={lowStock ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.productName}
        emptyMessage="No hay productos con stock bajo."
      />
    </div>
  )
}
