import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../components/CatalogFormDialog'
import { getSubcategoryColumns } from '../components/catalog.columns'
import {
  useCategories,
  useCreateSubcategory,
  useSubcategories,
  useUpdateSubcategory,
} from '../queries/useProducts'
import type { Subcategory } from '../types/erp'

export default function SubcategoriesPage() {
  const { data: subcategories, isLoading } = useSubcategories()
  const { data: categories } = useCategories()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()
  const [edit, setEdit] = useState<Subcategory | null>(null)
  const [parent, setParent] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Subcategorías</h1>
          <p className="text-sm text-muted-foreground">
            Subclasificación dentro de una categoría (ej: Lácteos dentro de Alimentos).
          </p>
        </div>
        <CatalogFormDialog<Subcategory>
          entity={edit}
          onClose={() => {
            setEdit(null)
            setParent('')
          }}
          onCreate={(data) =>
            createSubcategory.mutateAsync({ ...data, categoryId: parent, description: data.description })
          }
          onUpdate={(id, data) =>
            updateSubcategory.mutateAsync({ id, data: { ...data, categoryId: edit?.categoryId ?? '' } })
          }
          title="Subcategoría"
          description="Subdivisión de una categoría existente."
          triggerLabel="Nueva subcategoría"
          parentField={
            edit
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
        columns={getSubcategoryColumns({ onEdit: (item) => setEdit(item as Subcategory) })}
        data={subcategories ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay subcategorías registradas."
      />
    </div>
  )
}
