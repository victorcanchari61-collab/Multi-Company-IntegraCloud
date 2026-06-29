import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../components/CatalogFormDialog'
import { getSubbrandColumns } from '../components/catalog.columns'
import {
  useBrands,
  useCreateSubbrand,
  useSubbrands,
  useUpdateSubbrand,
} from '../queries/useProducts'
import type { Subbrand } from '../types/erp'

export default function SubbrandsPage() {
  const { data: subbrands, isLoading } = useSubbrands()
  const { data: brands } = useBrands()
  const createSubbrand = useCreateSubbrand()
  const updateSubbrand = useUpdateSubbrand()
  const [edit, setEdit] = useState<Subbrand | null>(null)
  const [parent, setParent] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Submarcas</h1>
          <p className="text-sm text-muted-foreground">
            Subdivisiones dentro de una marca (ej: Nike Air, Nike SB).
          </p>
        </div>
        <CatalogFormDialog<Subbrand>
          entity={edit}
          onClose={() => {
            setEdit(null)
            setParent('')
          }}
          onCreate={(data) =>
            createSubbrand.mutateAsync({ ...data, brandId: parent, description: data.description })
          }
          onUpdate={(id, data) =>
            updateSubbrand.mutateAsync({ id, data: { ...data, brandId: edit?.brandId ?? '' } })
          }
          title="Submarca"
          description="Subdivisión de una marca existente."
          triggerLabel="Nueva submarca"
          parentField={
            edit
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
        columns={getSubbrandColumns({ onEdit: (item) => setEdit(item as Subbrand) })}
        data={subbrands ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay submarcas registradas."
      />
    </div>
  )
}
