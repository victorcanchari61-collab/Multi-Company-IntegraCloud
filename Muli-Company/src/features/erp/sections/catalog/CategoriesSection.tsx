import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../../components/CatalogFormDialog'
import { getCategoryColumns } from '../../components/catalog.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import { useCategories, useCreateCategory, useUpdateCategory } from '../../queries/useProducts'
import type { Category } from '../../types/erp'

/**
 * SMART · cablea datos (queries), lógica (useCatalogCrud) y los dumb components.
 * Aquí NO hay JSX de tarjetas/inputs/tablas a mano: cada pieza es su componente.
 */
export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const { search, setSearch, editing, setEditing, filtered, stats } = useCatalogCrud<Category>(categories)

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar categoría…" />
        <CatalogFormDialog<Category>
          entity={editing}
          onClose={() => setEditing(null)}
          onCreate={(data) => createCategory.mutateAsync(data)}
          onUpdate={(id, data) => updateCategory.mutateAsync({ id, data })}
          title="Categoría"
          description="Agrupa productos por tipo general."
          triggerLabel="Nueva categoría"
        />
      </div>

      <DataTable
        columns={getCategoryColumns({ onEdit: (item) => setEditing(item as Category) })}
        data={filtered}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay categorías registradas."
      />
    </div>
  )
}
