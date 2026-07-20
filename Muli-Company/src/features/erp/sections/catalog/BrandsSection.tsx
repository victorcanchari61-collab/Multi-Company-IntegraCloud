import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../../components/CatalogFormDialog'
import { getBrandColumns } from '../../components/catalog.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import { useBrands, useCreateBrand, useUpdateBrand } from '../../queries/useProducts'
import type { Brand } from '../../types/erp'

export function BrandsSection() {
  const { data: brands, isLoading } = useBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()

  const { search, setSearch, editing, setEditing, filtered, stats } = useCatalogCrud<Brand>(brands)

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar marca…" />
        <CatalogFormDialog<Brand>
          entity={editing}
          onClose={() => setEditing(null)}
          onCreate={(data) => createBrand.mutateAsync(data)}
          onUpdate={(id, data) => updateBrand.mutateAsync({ id, data })}
          title="Marca"
          description="Registra las marcas disponibles en el catálogo."
          triggerLabel="Nueva marca"
        />
      </div>

      <DataTable
        columns={getBrandColumns({ onEdit: (item) => setEditing(item as Brand) })}
        data={filtered}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay marcas registradas."
      />
    </div>
  )
}
