import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { DataTable } from '@/components/data-table/DataTable'
import { useSetUnitStatus, useUnits } from '../queries/useUnits'
import { getUnitColumns } from '../components/units.columns'
import { UnitFormDialog } from '../components/UnitFormDialog'
import type { UnitOfMeasure } from '../types/erp'

export default function UnitsPage() {
  const { data, isLoading } = useUnits()
  const setStatus = useSetUnitStatus()
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null)

  const onToggleStatus = (unit: UnitOfMeasure) =>
    setStatus.mutate(
      { id: unit.id, active: !unit.isActive },
      {
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar'),
      },
    )

  const columns = useMemo(
    () =>
      getUnitColumns({
        pending: setStatus.isPending,
        onEdit: setEditing,
        onToggleStatus,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStatus.isPending],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Unidades de medida</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de unidades de medida (UND, KG, LT, MT…) usadas por los productos.
          </p>
        </div>
        <UnitFormDialog />
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(u) => u.id}
        mobileTitle={(u) => u.name}
        emptyMessage="No hay unidades registradas."
      />

      {editing && <UnitFormDialog unit={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
