import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { useState } from 'react'
import { useStockValuation, useWarehouses } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createColumnHelper } from '@tanstack/react-table'
import type { StockValuationDto } from '../../services/inventory.service'

const valCol = createColumnHelper<StockValuationDto>()
const valuationColumns = [
  valCol.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  valCol.accessor('productSku', { header: 'SKU', meta: { label: 'SKU' } }),
  valCol.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  valCol.accessor('quantity', {
    header: 'Cantidad',
    meta: { label: 'Cantidad' },
    cell: ({ getValue }) => getValue().toLocaleString(),
  }),
  valCol.accessor('unitCost', {
    header: 'Costo unit.',
    meta: { label: 'Costo unit.' },
    cell: ({ getValue }) => getValue() != null ? `S/ ${getValue()!.toFixed(4)}` : '-',
  }),
  valCol.accessor('totalValue', {
    header: 'Valor total',
    meta: { label: 'Valor total' },
    cell: ({ getValue }) => `S/ ${getValue().toFixed(2)}`,
  }),
]

export default function ValorizacionPage() {
  const { data: warehouses } = useWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const { data: valuation, isLoading } = useStockValuation(selectedWarehouse || undefined)

  const totalValue = (valuation ?? []).reduce((s, v) => s + v.totalValue, 0)

  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Valorización de stock</h1>
        <p className="text-sm text-muted-foreground">
          Valor total del inventario calculado al costo promedio ponderado.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Almacén:</span>
          <Select value={selectedWarehouse} onValueChange={(v) => setSelectedWarehouse(v ?? '')}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos los almacenes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los almacenes</SelectItem>
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {valuation && (
            <span className="text-sm text-muted-foreground">
              Valor total: <strong className="text-foreground">
                S/ {totalValue.toFixed(2)}
              </strong>
            </span>
          )}
        </div>
        <DataTable
          columns={valuationColumns}
          data={valuation ?? []}
          loading={isLoading}
          getRowId={(r) => r.id}
          mobileTitle={(r) => r.productName}
          emptyMessage="No hay stock valorizado."
        />
      </div>
    </div>
  )
}
