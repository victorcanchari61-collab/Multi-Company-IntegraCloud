import { useTransfers, useCreateTransfer, useCompleteTransfer, useCancelTransfer } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { TransferFormDialog } from '../../components/inventory/TransferFormDialog'
import { createColumnHelper } from '@tanstack/react-table'
import type { TransferDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<TransferDto>()

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
}

const statusColors: Record<string, string> = {
  PENDING: 'text-amber-600',
  COMPLETED: 'text-success',
  CANCELLED: 'text-destructive',
}

const columns = [
  columnHelper.accessor('createdAt', {
    header: 'Fecha',
    meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
  }),
  columnHelper.accessor('fromWarehouse', { header: 'Origen', meta: { label: 'Origen' } }),
  columnHelper.accessor('toWarehouse', { header: 'Destino', meta: { label: 'Destino' } }),
  columnHelper.accessor('status', {
    header: 'Estado',
    meta: { label: 'Estado' },
    cell: ({ getValue }) => (
      <span className={`font-medium ${statusColors[getValue()] ?? ''}`}>
        {statusLabels[getValue()] ?? getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('items', {
    header: 'Items',
    meta: { label: 'Items' },
    cell: ({ getValue }) => getValue().length,
  }),
]

export function TransfersSection() {
  const { data: transfers, isLoading } = useTransfers()
  const createTransfer = useCreateTransfer()
  const completeTransfer = useCompleteTransfer()
  const cancelTransfer = useCancelTransfer()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Nueva transferencia
        </Button>
      </div>

      <DataTable
        columns={[
          ...columns,
          columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            meta: { label: 'Acciones' },
            cell: ({ row }) => (
              <div className="flex gap-2">
                {row.original.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => completeTransfer.mutate(row.original.id)}
                    >
                      Completar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelTransfer.mutate(row.original.id)}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            ),
          }),
        ]}
        data={transfers ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => `${r.fromWarehouse} → ${r.toWarehouse}`}
        emptyMessage="No hay transferencias registradas."
      />

      <TransferFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={async (data) => {
          await createTransfer.mutateAsync(data)
          setDialogOpen(false)
        }}
        saving={createTransfer.isPending}
      />
    </div>
  )
}
