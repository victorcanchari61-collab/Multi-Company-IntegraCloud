import { useState } from 'react'
import { useProducts } from '../../queries/useProducts'
import { useKardexByProduct } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createColumnHelper } from '@tanstack/react-table'
import type { KardexEntryDto } from '../../services/inventory.service'

const col = createColumnHelper<KardexEntryDto>()
const columns = [
  col.accessor('createdAt', {
    header: 'Fecha',
    meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
  }),
  col.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  col.accessor('movementType', { header: 'Movimiento', meta: { label: 'Movimiento' } }),
  col.accessor('quantityIn', {
    header: 'Entrada',
    meta: { label: 'Entrada' },
    cell: ({ getValue }) => getValue() > 0 ? getValue() : '-',
  }),
  col.accessor('quantityOut', {
    header: 'Salida',
    meta: { label: 'Salida' },
    cell: ({ getValue }) => getValue() > 0 ? getValue() : '-',
  }),
  col.accessor('balance', {
    header: 'Saldo',
    meta: { label: 'Saldo' },
    cell: ({ getValue }) => getValue(),
  }),
  col.accessor('unitCost', {
    header: 'Costo unit.',
    meta: { label: 'Costo unit.' },
    cell: ({ getValue }) => (getValue() ?? 0) > 0 ? `S/ ${(getValue() ?? 0).toFixed(4)}` : '-',
  }),
  col.accessor('totalCost', {
    header: 'Costo total',
    meta: { label: 'Costo total' },
    cell: ({ getValue }) => (getValue() ?? 0) > 0 ? `S/ ${(getValue() ?? 0).toFixed(2)}` : '-',
  }),
]

export function AverageCostSection() {
  const { data: products } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState('')
  const { data: entries, isLoading } = useKardexByProduct(selectedProduct)

  const lastEntry = entries?.[entries.length - 1]
  const currentCost = lastEntry?.unitCost ?? 0
  const currentBalance = lastEntry?.balance ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Producto:</span>
        <Select value={selectedProduct} onValueChange={(v) => setSelectedProduct(v ?? '')}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct && lastEntry && (
        <div className="flex gap-6 rounded-lg border bg-blue-50/50 p-4 text-sm">
          <div>
            <span className="text-muted-foreground">Stock actual:</span>
            <p className="text-lg font-semibold">{currentBalance}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Costo unit. promedio:</span>
            <p className="text-lg font-semibold">S/ {currentCost.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Valor total:</span>
            <p className="text-lg font-semibold">S/ {(currentBalance * currentCost).toFixed(2)}</p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={entries ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => `${r.movementType} - S/ ${(r.unitCost ?? 0).toFixed(4)}`}
        emptyMessage={selectedProduct ? 'No hay movimientos de kárdex para este producto.' : 'Selecciona un producto para ver su costo promedio.'}
      />
    </div>
  )
}
