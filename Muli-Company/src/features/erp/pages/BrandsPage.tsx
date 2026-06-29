import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../components/CatalogFormDialog'
import { getBrandColumns } from '../components/catalog.columns'
import { useBrands, useCreateBrand, useUpdateBrand } from '../queries/useProducts'
import type { Brand } from '../types/erp'

export default function BrandsPage() {
  const { data: brands, isLoading } = useBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const [edit, setEdit] = useState<Brand | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Marcas</h1>
          <p className="text-sm text-muted-foreground">Marcas de productos (ej: Sony, Nike, Samsung).</p>
        </div>
        <CatalogFormDialog<Brand>
          entity={edit}
          onClose={() => setEdit(null)}
          onCreate={(data) => createBrand.mutateAsync(data)}
          onUpdate={(id, data) => updateBrand.mutateAsync({ id, data })}
          title="Marca"
          description="Registra las marcas disponibles en el catálogo."
          triggerLabel="Nueva marca"
        />
      </div>
      <DataTable
        columns={getBrandColumns({ onEdit: (item) => setEdit(item as Brand) })}
        data={brands ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay marcas registradas."
      />
    </div>
  )
}
