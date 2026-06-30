import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { PriceListFormDialog } from '../../components/PriceListFormDialog'
import { getPriceListColumns } from '../../components/priceLists.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import {
  useCreatePriceList,
  usePriceLists,
  useSetPriceListStatus,
  useUpdatePriceList,
} from '../../queries/usePriceLists'
import type { PriceList } from '../../types/erp'

export function PriceListsSection() {
  const { data: priceLists, isLoading } = usePriceLists()
  const createPriceList = useCreatePriceList()
  const updatePriceList = useUpdatePriceList()
  const setStatus = useSetPriceListStatus()

  const { search, setSearch, editing, setEditing, filtered, stats } =
    useCatalogCrud<PriceList>(priceLists)

  const columns = useMemo(
    () =>
      getPriceListColumns({
        pending: setStatus.isPending,
        onEdit: setEditing,
        onToggleStatus: (pl) => setStatus.mutate({ id: pl.id, active: !pl.isActive }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStatus.isPending],
  )

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar lista de precio…" />
        <PriceListFormDialog
          priceList={editing}
          onClose={() => setEditing(null)}
          onCreate={(data) => createPriceList.mutateAsync(data)}
          onUpdate={(id, data) => updatePriceList.mutateAsync({ id, data })}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        getRowId={(pl) => pl.id}
        mobileTitle={(pl) => pl.name}
        emptyMessage="No hay listas de precios registradas."
      />
    </div>
  )
}
