import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../components/CatalogFormDialog'
import { getCategoryColumns } from '../components/catalog.columns'
import { useCategories, useCreateCategory, useUpdateCategory } from '../queries/useProducts'
import type { Category } from '../types/erp'

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [edit, setEdit] = useState<Category | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Clasificación general de productos (ej: Alimentos, Electrónicos, Vestimenta).
          </p>
        </div>
        <CatalogFormDialog<Category>
          entity={edit}
          onClose={() => setEdit(null)}
          onCreate={(data) => createCategory.mutateAsync(data)}
          onUpdate={(id, data) => updateCategory.mutateAsync({ id, data })}
          title="Categoría"
          description="Agrupa productos por tipo general."
          triggerLabel="Nueva categoría"
        />
      </div>
      <DataTable
        columns={getCategoryColumns({ onEdit: (item) => setEdit(item as Category) })}
        data={categories ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay categorías registradas."
      />
    </div>
  )
}
