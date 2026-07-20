import { useState } from 'react'
import { useProducts } from '../../queries/useProducts'
import { useProductLots } from '../../queries/useLots'
import { useSerialsByProduct, useRegisterSerial, useUpdateSerialStatus } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createColumnHelper } from '@tanstack/react-table'
import { SerialFormDialog } from '../../components/inventory/SerialFormDialog'
import type { ProductLot } from '../../types/erp'
import type { SerialNumberDto } from '../../services/inventory.service'

const lotColumnHelper = createColumnHelper<ProductLot>()
const lotColumns = [
  lotColumnHelper.accessor('number', { header: 'Lote', meta: { label: 'Lote' } }),
  lotColumnHelper.accessor('expiryDate', { header: 'Vencimiento', meta: { label: 'Vencimiento' } }),
  lotColumnHelper.accessor('initialStock', { header: 'Stock inicial', meta: { label: 'Stock inicial' } }),
]

const serialColumnHelper = createColumnHelper<SerialNumberDto>()
const serialColumns = [
  serialColumnHelper.accessor('serial', { header: 'N° Serie', meta: { label: 'N° Serie' } }),
  serialColumnHelper.accessor('batchNumber', { header: 'Lote', meta: { label: 'Lote' } }),
  serialColumnHelper.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  serialColumnHelper.accessor('status', {
    header: 'Estado',
    meta: { label: 'Estado' },
    cell: ({ getValue }) => {
      const status = getValue()
      const variant = status === 'IN_STOCK' ? 'success' : status === 'SOLD' ? 'secondary' : 'destructive'
      return <Badge variant={variant}>{status}</Badge>
    },
  }),
]

export function LotsAndSerialsSection() {
  const { data: products } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState('')
  const { data: lots } = useProductLots(selectedProduct)
  const { data: serials, isLoading: serialsLoading } = useSerialsByProduct(selectedProduct)
  const registerSerial = useRegisterSerial()
  const updateStatus = useUpdateSerialStatus()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Producto:</span>
        <Select value={selectedProduct} onValueChange={(v) => setSelectedProduct(v ?? "")}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Lotes</h3>
            <DataTable
              columns={lotColumns}
              data={lots ?? []}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.number}
              emptyMessage="No hay lotes para este producto."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Números de serie</h3>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="size-3" /> Registrar serie
              </Button>
            </div>
            <DataTable
              columns={[
                ...serialColumns,
                serialColumnHelper.display({
                  id: 'actions',
                  header: 'Acciones',
                  meta: { label: 'Acciones' },
                  cell: ({ row }) => row.original.status === 'IN_STOCK' ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: row.original.id, status: 'SOLD' })}>
                        Marcar vendido
                      </Button>
                    </div>
                  ) : null,
                }),
              ]}
              data={serials ?? []}
              loading={serialsLoading}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.serial}
              emptyMessage="No hay números de serie registrados."
            />
          </div>

          <SerialFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            productId={selectedProduct}
            lots={lots ?? []}
            onSave={async (data) => {
              await registerSerial.mutateAsync(data)
              setDialogOpen(false)
            }}
            saving={registerSerial.isPending}
          />
        </>
      )}
    </div>
  )
}
