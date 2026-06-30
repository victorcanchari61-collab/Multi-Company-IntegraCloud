import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../../components/CatalogFormDialog'
import { getSubbrandColumns } from '../../components/catalog.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import {
  useBrands,
  useCreateSubbrand,
  useSubbrands,
  useUpdateSubbrand,
} from '../../queries/useProducts'
import type { Subbrand } from '../../types/erp'

export function SubbrandsSection() {
  const { data: subbrands, isLoading } = useSubbrands()
  const { data: brands } = useBrands()
  const createSubbrand = useCreateSubbrand()
  const updateSubbrand = useUpdateSubbrand()

  const { search, setSearch, editing, setEditing, filtered, stats } =
    useCatalogCrud<Subbrand>(subbrands)
  const [parent, setParent] = useState('')

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar submarca…" />
        <CatalogFormDialog<Subbrand>
          entity={editing}
          onClose={() => {
            setEditing(null)
            setParent('')
          }}
          onCreate={(data) =>
            createSubbrand.mutateAsync({ ...data, brandId: parent, description: data.description })
          }
          onUpdate={(id, data) =>
            updateSubbrand.mutateAsync({ id, data: { ...data, brandId: editing?.brandId ?? '' } })
          }
          title="Submarca"
          description="Subdivisión de una marca existente."
          triggerLabel="Nueva submarca"
          parentField={
            editing
              ? undefined
              : {
                  label: 'Marca',
                  value: parent,
                  onChange: setParent,
                  options: (brands ?? []).map((b) => ({ value: b.id, label: b.name })),
                }
          }
        />
      </div>

      <DataTable
        columns={getSubbrandColumns({ onEdit: (item) => setEditing(item as Subbrand) })}
        data={filtered}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay submarcas registradas."
      />
    </div>
  )
}
