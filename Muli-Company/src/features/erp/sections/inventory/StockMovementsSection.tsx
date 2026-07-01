import { useStockMovements, useCreateStockMovement, useWarehouses } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { StockMovementFormDialog } from '../../components/inventory/StockMovementFormDialog'
import { createColumnHelper } from '@tanstack/react-table'
import type { StockMovementDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<StockMovementDto>()

const movementLabels: Record<string, string> = {
  PURCHASE_IN: 'Compra',
  SALE_OUT: 'Venta',
  TRANSFER_IN: 'Transferencia (entrada)',
  TRANSFER_OUT: 'Transferencia (salida)',
  ADJUSTMENT_POSITIVE: 'Ajuste (+)',
  ADJUSTMENT_NEGATIVE: 'Ajuste (-)',
  SALE_RETURN: 'Devolución venta',
  PURCHASE_RETURN: 'Devolución compra',
}

const columns = [
  columnHelper.accessor('createdAt', {
    header: 'Fecha',
    meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
  }),
  columnHelper.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  columnHelper.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  columnHelper.accessor('movementType', {
    header: 'Tipo',
    meta: { label: 'Tipo' },
    cell: ({ getValue }) => movementLabels[getValue()] ?? getValue(),
  }),
  columnHelper.accessor('quantity', {
    header: 'Cantidad',
    meta: { label: 'Cantidad' },
    cell: ({ getValue, row }) => (
      <span className={
        ['PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_POSITIVE', 'SALE_RETURN'].includes(row.original.movementType)
          ? 'text-success font-medium'
          : 'text-destructive font-medium'
      }>
        {['PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_POSITIVE', 'SALE_RETURN'].includes(row.original.movementType)
          ? `+${getValue()}`
          : `-${getValue()}`}
      </span>
    ),
  }),
  columnHelper.accessor('unitCost', {
    header: 'Costo unit.',
    meta: { label: 'Costo unit.' },
    cell: ({ getValue }) => getValue() ? `S/. ${getValue()}` : '-',
  }),
  columnHelper.accessor('notes', { header: 'Notas', meta: { label: 'Notas' } }),
]

export function StockMovementsSection() {
  const { data: movements, isLoading } = useStockMovements()
  const { data: warehouses } = useWarehouses()
  const createMovement = useCreateStockMovement()
  const [dialogOpen, setDialogOpen] = useState(false)
  const initialized = useRef(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Nuevo movimiento
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={movements ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => `${r.productName} - ${movementLabels[r.movementType] ?? r.movementType}`}
        emptyMessage="No hay movimientos registrados."
      />

      <StockMovementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        warehouses={warehouses ?? []}
        onSave={async (data) => {
          await createMovement.mutateAsync(data)
          setDialogOpen(false)
        }}
        saving={createMovement.isPending}
      />
    </div>
  )
}
