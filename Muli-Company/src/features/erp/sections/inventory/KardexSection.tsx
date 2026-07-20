import { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProducts } from '../../queries/useProducts'
import { useKardexByProduct } from '../../queries/useInventory'
import type { KardexEntryDto } from '../../services/inventory.service'

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

const col = createColumnHelper<KardexEntryDto>()
const columns = [
  col.accessor('createdAt', {
    header: 'Fecha',
    meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
  }),
  col.accessor('warehouseName', {
    header: 'Almacén',
    meta: { label: 'Almacén' },
    cell: ({ getValue }) => getValue() ?? '—',
  }),
  col.accessor('movementType', {
    header: 'Movimiento',
    meta: { label: 'Movimiento' },
    cell: ({ getValue }) => movementLabels[getValue()] ?? getValue(),
  }),
  col.accessor('quantityIn', {
    header: 'Entrada',
    meta: { label: 'Entrada' },
    cell: ({ getValue }) =>
      getValue() > 0 ? <span className="font-medium text-success">+{getValue()}</span> : '—',
  }),
  col.accessor('quantityOut', {
    header: 'Salida',
    meta: { label: 'Salida' },
    cell: ({ getValue }) =>
      getValue() > 0 ? <span className="font-medium text-destructive">-{getValue()}</span> : '—',
  }),
  col.accessor('unitCost', {
    header: 'Costo unit.',
    meta: { label: 'Costo unit.' },
    cell: ({ getValue }) => {
      const v = getValue()
      return v != null ? `S/ ${v.toFixed(2)}` : '—'
    },
  }),
  col.accessor('balance', {
    header: 'Saldo',
    meta: { label: 'Saldo' },
    cell: ({ getValue }) => <span className="font-semibold tabular-nums">{getValue()}</span>,
  }),
]

export function KardexSection() {
  const { data: products } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState('')
  const { data: kardex, isLoading } = useKardexByProduct(selectedProduct)

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
              <SelectItem key={p.id} value={p.id}>
                {p.name} {p.sku ? `(${p.sku})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct ? (
        <DataTable
          columns={columns}
          data={kardex ?? []}
          loading={isLoading}
          getRowId={(r) => r.id}
          mobileTitle={(r) => new Date(r.createdAt).toLocaleDateString()}
          emptyMessage="Sin movimientos para este producto."
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Selecciona un producto para ver su kárdex (entradas, salidas y saldo acumulado).
        </p>
      )}
    </div>
  )
}
