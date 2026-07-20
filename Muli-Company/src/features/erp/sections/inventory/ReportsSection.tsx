import { useState } from 'react'
import { useStockValuation, useStockLowReorder, useStockMovements, useWarehouses } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createColumnHelper } from '@tanstack/react-table'
import type { StockValuationDto, StockDto, StockMovementDto } from '../../services/inventory.service'

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
]

const zeroCol = createColumnHelper<StockValuationDto>()
const zeroStockColumns = [
  zeroCol.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  zeroCol.accessor('productSku', { header: 'SKU', meta: { label: 'SKU' } }),
  zeroCol.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  zeroCol.accessor('quantity', {
    header: 'Stock actual',
    meta: { label: 'Stock actual' },
    cell: ({ getValue }) => (
      <span className="text-destructive font-medium">{getValue()}</span>
    ),
  }),
]

const movCol = createColumnHelper<StockMovementDto>()
const movementColumns = [
  movCol.accessor('createdAt', {
    header: 'Fecha',
    meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  movCol.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  movCol.display({
    id: 'type',
    header: 'Tipo',
    meta: { label: 'Tipo' },
    cell: ({ row }) => {
      const labels: Record<string, string> = {
        PURCHASE_IN: 'Compra', SALE_OUT: 'Venta',
        TRANSFER_IN: 'Transf. entrada', TRANSFER_OUT: 'Transf. salida',
        ADJUSTMENT_POSITIVE: 'Ajuste (+)', ADJUSTMENT_NEGATIVE: 'Ajuste (-)',
        SALE_RETURN: 'Dev. venta', PURCHASE_RETURN: 'Dev. compra',
      }
      return labels[row.original.movementType] ?? row.original.movementType
    },
  }),
  movCol.accessor('quantity', {
    header: 'Cant.',
    meta: { label: 'Cant.' },
    cell: ({ getValue, row }) => (
      <span className={['PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_POSITIVE', 'SALE_RETURN'].includes(row.original.movementType) ? 'text-success font-medium' : 'text-destructive font-medium'}>
        {['PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_POSITIVE', 'SALE_RETURN'].includes(row.original.movementType) ? `+${getValue()}` : `-${getValue()}`}
      </span>
    ),
  }),
]

export function ReportsSection() {
  const { data: warehouses } = useWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const { data: valuation, isLoading: valLoading } = useStockValuation(selectedWarehouse || undefined)
  const { data: lowStock, isLoading: lowLoading } = useStockLowReorder()
  const { data: movements, isLoading: movLoading } = useStockMovements()

  const totalValue = (valuation ?? []).reduce((s, v) => s + v.totalValue, 0)
  const zeroStock = (valuation ?? []).filter((v) => v.quantity === 0)

  return (
    <Tabs defaultValue="valorizacion">
      <TabsList>
        <TabsTrigger value="valorizacion">Valorización</TabsTrigger>
        <TabsTrigger value="reposicion">Stock bajo</TabsTrigger>
        <TabsTrigger value="sin-stock">Sin stock</TabsTrigger>
        <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
      </TabsList>

      <TabsContent value="valorizacion" className="space-y-4 pt-4">
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
              Valor total: <strong className="text-foreground">S/ {totalValue.toFixed(2)}</strong>
            </span>
          )}
        </div>
        <DataTable
          columns={valuationColumns}
          data={valuation ?? []}
          loading={valLoading}
          getRowId={(r) => r.id}
          mobileTitle={(r) => r.productName}
          emptyMessage="No hay stock valorizado."
        />
      </TabsContent>

      <TabsContent value="reposicion" className="pt-4">
        <DataTable
          columns={lowColumns}
          data={lowStock ?? []}
          loading={lowLoading}
          getRowId={(r) => r.id}
          mobileTitle={(r) => r.productName}
          emptyMessage="No hay productos con stock bajo."
        />
      </TabsContent>

      <TabsContent value="sin-stock" className="space-y-4 pt-4">
        <p className="text-sm text-muted-foreground">
          Productos con stock en cero. Total: {zeroStock.length}
        </p>
        <DataTable
          columns={zeroStockColumns}
          data={zeroStock}
          loading={valLoading}
          getRowId={(r) => r.id}
          mobileTitle={(r) => r.productName}
          emptyMessage="No hay productos sin stock."
        />
      </TabsContent>

      <TabsContent value="movimientos" className="pt-4">
        <DataTable
          columns={movementColumns}
          data={movements ?? []}
          loading={movLoading}
          getRowId={(r) => r.id}
          mobileTitle={(r) => `${r.productName} - ${r.movementType}`}
          emptyMessage="No hay movimientos registrados."
        />
      </TabsContent>
    </Tabs>
  )
}
