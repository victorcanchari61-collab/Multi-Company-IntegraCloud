import { useState } from 'react'
import { useWarehouses, useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocationFormDialog } from '../../components/inventory/LocationFormDialog'
import { createColumnHelper } from '@tanstack/react-table'
import type { LocationDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<LocationDto>()

const columns = [
  columnHelper.accessor('code', { header: 'Código', meta: { label: 'Código' } }),
  columnHelper.accessor('description', { header: 'Descripción', meta: { label: 'Descripción' } }),
  columnHelper.accessor('zone', { header: 'Zona', meta: { label: 'Zona' } }),
  columnHelper.accessor('parentCode', { header: 'Ubicación padre', meta: { label: 'Ubicación padre' } }),
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

export function LocationsSection() {
  const { data: warehouses } = useWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const { data: locations, isLoading } = useLocations(selectedWarehouse)
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const deleteLocation = useDeleteLocation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LocationDto | null>(null)

  const handleSave = async (data: { code: string; description?: string | null; zone?: string | null; parentId?: string | null }) => {
    if (editing) {
      await updateLocation.mutateAsync({ warehouseId: selectedWarehouse, id: editing.id, data })
    } else {
      await createLocation.mutateAsync({ warehouseId: selectedWarehouse, data })
    }
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Almacén:</span>
          <Select value={selectedWarehouse} onValueChange={(v) => setSelectedWarehouse(v ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar almacén" />
            </SelectTrigger>
            <SelectContent>
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedWarehouse && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Nueva ubicación
          </Button>
        )}
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
                <Button variant="outline" size="sm" onClick={() => { setEditing(row.original); setDialogOpen(true) }}>
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteLocation.mutate({ warehouseId: selectedWarehouse, id: row.original.id })}>
                  Eliminar
                </Button>
              </div>
            ),
          }),
        ]}
        data={locations ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.code}
        emptyMessage="No hay ubicaciones en este almacén."
      />

      <LocationFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}
        editing={editing}
        locations={locations ?? []}
        onSave={handleSave}
        saving={createLocation.isPending || updateLocation.isPending}
      />
    </div>
  )
}
