import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useSetWarehouseStatus } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { WarehouseFormDialog } from '../../components/inventory/WarehouseFormDialog'
import { createColumnHelper } from '@tanstack/react-table'
import type { WarehouseDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<WarehouseDto>()

const columns = [
  columnHelper.accessor('code', { header: 'Código', meta: { label: 'Código' } }),
  columnHelper.accessor('name', { header: 'Nombre', meta: { label: 'Nombre' } }),
  columnHelper.accessor('type', { header: 'Tipo', meta: { label: 'Tipo' } }),
  columnHelper.accessor('location', { header: 'Ubicación', meta: { label: 'Ubicación' } }),
  columnHelper.accessor('isActive', {
    header: 'Estado',
    meta: { label: 'Estado' },
    cell: ({ getValue }) => (
      <span className={getValue() ? 'text-success' : 'text-destructive'}>
        {getValue() ? 'Activo' : 'Inactivo'}
      </span>
    ),
  }),
]

export function WarehousesSection() {
  const { data: warehouses, isLoading } = useWarehouses()
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()
  const setStatus = useSetWarehouseStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WarehouseDto | null>(null)

  const handleSave = async (data: { code: string; name: string; type: string | null; location: string | null }) => {
    if (editing) {
      await updateWarehouse.mutateAsync({ id: editing.id, data })
    } else {
      await createWarehouse.mutateAsync(data)
    }
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Nuevo almacén
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(row.original)
                    setDialogOpen(true)
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus.mutate({ id: row.original.id, isActive: !row.original.isActive })
                  }
                >
                  {row.original.isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            ),
          }),
        ]}
        data={warehouses ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay almacenes registrados."
      />

      <WarehouseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}
        editing={editing}
        onSave={handleSave}
        saving={createWarehouse.isPending || updateWarehouse.isPending}
      />
    </div>
  )
}
