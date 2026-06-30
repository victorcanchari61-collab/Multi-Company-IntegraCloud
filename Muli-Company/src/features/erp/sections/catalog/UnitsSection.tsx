import { useMemo } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { DataTable } from '@/components/data-table/DataTable'
import { UnitFormDialog } from '../../components/UnitFormDialog'
import { getUnitColumns } from '../../components/units.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import { useSetUnitStatus, useUnits } from '../../queries/useUnits'
import type { UnitOfMeasure } from '../../types/erp'

export function UnitsSection() {
  const { data: units, isLoading } = useUnits()
  const setStatus = useSetUnitStatus()

  const { search, setSearch, editing, setEditing, filtered, stats } =
    useCatalogCrud<UnitOfMeasure>(units)

  const columns = useMemo(
    () =>
      getUnitColumns({
        pending: setStatus.isPending,
        onEdit: setEditing,
        onToggleStatus: (u) =>
          setStatus.mutate(
            { id: u.id, active: !u.isActive },
            { onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo actualizar') },
          ),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStatus.isPending],
  )

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar unidad…" />
        <UnitFormDialog unit={editing ?? undefined} onClose={() => setEditing(null)} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        getRowId={(u) => u.id}
        mobileTitle={(u) => u.name}
        emptyMessage="No hay unidades registradas."
      />
    </div>
  )
}
