import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../../components/CatalogFormDialog'
import { getSubcategoryColumns } from '../../components/catalog.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import {
  useCategories,
  useCreateSubcategory,
  useSubcategories,
  useUpdateSubcategory,
} from '../../queries/useProducts'
import type { Subcategory } from '../../types/erp'

export function SubcategoriesSection() {
  const { data: subcategories, isLoading } = useSubcategories()
  const { data: categories } = useCategories()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()

  const { search, setSearch, editing, setEditing, filtered, stats } =
    useCatalogCrud<Subcategory>(subcategories)
  const [parent, setParent] = useState('')

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar subcategoría…" />
        <CatalogFormDialog<Subcategory>
          entity={editing}
          onClose={() => {
            setEditing(null)
            setParent('')
          }}
          onCreate={(data) =>
            createSubcategory.mutateAsync({ ...data, categoryId: parent, description: data.description })
          }
          onUpdate={(id, data) =>
            updateSubcategory.mutateAsync({ id, data: { ...data, categoryId: editing?.categoryId ?? '' } })
          }
          title="Subcategoría"
          description="Subdivisión de una categoría existente."
          triggerLabel="Nueva subcategoría"
          parentField={
            editing
              ? undefined
              : {
                  label: 'Categoría',
                  value: parent,
                  onChange: setParent,
                  options: (categories ?? []).map((c) => ({ value: c.id, label: c.name })),
                }
          }
        />
      </div>

      <DataTable
        columns={getSubcategoryColumns({ onEdit: (item) => setEditing(item as Subcategory) })}
        data={filtered}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay subcategorías registradas."
      />
    </div>
  )
}
