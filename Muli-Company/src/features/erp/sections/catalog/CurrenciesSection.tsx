import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CurrencyFormDialog } from '../../components/CurrencyFormDialog'
import { getCurrencyColumns } from '../../components/currencies.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import {
  useCreateCurrency,
  useCurrencies,
  useSetCurrencyStatus,
  useUpdateCurrency,
} from '../../queries/useCurrencies'
import type { Currency } from '../../types/erp'

export function CurrenciesSection() {
  const { data: currencies, isLoading } = useCurrencies()
  const createCurrency = useCreateCurrency()
  const updateCurrency = useUpdateCurrency()
  const setStatus = useSetCurrencyStatus()

  const { search, setSearch, editing, setEditing, filtered, stats } =
    useCatalogCrud<Currency>(currencies)

  const columns = useMemo(
    () =>
      getCurrencyColumns({
        pending: setStatus.isPending,
        onEdit: setEditing,
        onToggleStatus: (c) => setStatus.mutate({ id: c.id, active: !c.isActive }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStatus.isPending],
  )

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar moneda…" />
        <CurrencyFormDialog
          currency={editing}
          onClose={() => setEditing(null)}
          onCreate={(data) => createCurrency.mutateAsync(data)}
          onUpdate={(id, data) => updateCurrency.mutateAsync({ id, data })}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        getRowId={(c) => c.id}
        mobileTitle={(c) => c.name}
        emptyMessage="No hay monedas registradas."
      />
    </div>
  )
}
