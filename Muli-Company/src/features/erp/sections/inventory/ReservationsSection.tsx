import { useState } from 'react'
import { useWarehouses, useReservations, useCreateReservation, useReleaseReservation } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createColumnHelper } from '@tanstack/react-table'
import { ReservationFormDialog } from '../../components/inventory/ReservationFormDialog'
import type { StockReservationDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<StockReservationDto>()

const columns = [
  columnHelper.accessor('productName', { header: 'Producto', meta: { label: 'Producto' } }),
  columnHelper.accessor('productSku', { header: 'SKU', meta: { label: 'SKU' } }),
  columnHelper.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  columnHelper.accessor('quantity', { header: 'Cantidad', meta: { label: 'Cantidad' } }),
  columnHelper.accessor('referenceType', { header: 'Referencia', meta: { label: 'Referencia' } }),
  columnHelper.accessor('status', {
    header: 'Estado',
    meta: { label: 'Estado' },
    cell: ({ getValue }) => (
      <Badge variant={getValue() === 'ACTIVE' ? 'default' : 'secondary'}>{getValue()}</Badge>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Creado',
    meta: { label: 'Creado' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
]

export function ReservationsSection() {
  const { data: warehouses } = useWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const { data: reservations, isLoading } = useReservations(selectedWarehouse || undefined)
  const createReservation = useCreateReservation()
  const releaseReservation = useReleaseReservation()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Almacén:</span>
          <Select value={selectedWarehouse} onValueChange={(v) => setSelectedWarehouse(v ?? "")}>
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
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Nueva reserva
        </Button>
      </div>

      <DataTable
        columns={[
          ...columns,
          columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            meta: { label: 'Acciones' },
            cell: ({ row }) => row.original.status === 'ACTIVE' ? (
              <Button variant="outline" size="sm" onClick={() => releaseReservation.mutate(row.original.id)}>
                Liberar
              </Button>
            ) : null,
          }),
        ]}
        data={reservations ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.productName}
        emptyMessage="No hay reservas activas."
      />

      <ReservationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={async (data) => {
          await createReservation.mutateAsync(data)
          setDialogOpen(false)
        }}
        saving={createReservation.isPending}
      />
    </div>
  )
}
