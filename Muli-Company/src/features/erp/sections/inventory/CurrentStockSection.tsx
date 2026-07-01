import { useEffect, useRef, useState } from 'react'
import { useWarehouses, useStockByWarehouse } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createColumnHelper } from '@tanstack/react-table'
import type { StockDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<StockDto>()

const columns = [
  columnHelper.accessor('productSku', { header: 'SKU', meta: { label: 'SKU' } }),
  columnHelper.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  columnHelper.accessor('quantity', {
    header: 'Cantidad',
    meta: { label: 'Cantidad' },
    cell: ({ getValue, row }) => (
      <span className={getValue() <= 0 ? 'text-destructive font-medium' : ''}>
        {getValue()} {row.original.reservedQuantity > 0 && `(${row.original.available} disp.)`}
      </span>
    ),
  }),
  columnHelper.accessor('reservedQuantity', { header: 'Reservado', meta: { label: 'Reservado' } }),
  columnHelper.accessor('available', {
    header: 'Disponible',
    meta: { label: 'Disponible' },
    cell: ({ getValue }) => (
      <span className={getValue() <= 0 ? 'text-destructive font-medium' : ''}>
        {getValue()}
      </span>
    ),
  }),
]

export function CurrentStockSection() {
  const { data: warehouses } = useWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && warehouses && warehouses.length > 0) {
      setSelectedWarehouse(warehouses[0].id)
      initialized.current = true
    }
  }, [warehouses])

  const { data: stock, isLoading } = useStockByWarehouse(selectedWarehouse)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Almacén:</span>
        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar almacén" />
          </SelectTrigger>
          <SelectContent>
            {warehouses?.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={stock ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.productName}
        emptyMessage="No hay stock en este almacén."
      />
    </div>
  )
}
