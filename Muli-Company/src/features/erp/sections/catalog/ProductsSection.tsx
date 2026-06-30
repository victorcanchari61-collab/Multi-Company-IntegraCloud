import { DataTable } from '@/components/data-table/DataTable'
import { ProductFormDialog } from '../../components/ProductFormDialog'
import { getProductColumns } from '../../components/catalog.columns'
import { CatalogStatsCard } from '../../components/catalog/CatalogStatsCard'
import { CatalogFilterBar } from '../../components/catalog/CatalogFilterBar'
import { useCatalogCrud } from '../../hooks/useCatalogCrud'
import { useCreateProduct, useProducts, useUpdateProduct } from '../../queries/useProducts'
import type { Product } from '../../types/erp'

export function ProductsSection() {
  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const { search, setSearch, editing, setEditing, filtered, stats } = useCatalogCrud<Product>(products)

  return (
    <div className="space-y-4">
      <CatalogStatsCard stats={stats} />

      <div className="flex items-center justify-between gap-3">
        <CatalogFilterBar value={search} onChange={setSearch} placeholder="Buscar producto…" />
        <ProductFormDialog
          key={editing?.id ?? 'create-product'}
          product={editing}
          onClose={() => setEditing(null)}
          onCreate={(data) => createProduct.mutateAsync(data)}
          onUpdate={(id, data) => updateProduct.mutateAsync({ id, data })}
        />
      </div>

      <DataTable
        columns={getProductColumns({ onEdit: (item) => setEditing(item as unknown as Product) })}
        data={filtered}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay productos registrados."
      />
    </div>
  )
}
