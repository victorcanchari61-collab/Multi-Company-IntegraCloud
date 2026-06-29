import { useState } from 'react'
import { DataTable } from '@/components/data-table/DataTable'
import { ProductFormDialog } from '../components/ProductFormDialog'
import { getProductColumns } from '../components/catalog.columns'
import { useCreateProduct, useProducts, useUpdateProduct } from '../queries/useProducts'
import type { Product } from '../types/erp'

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">Ficha maestra de productos del catálogo.</p>
        </div>
        <ProductFormDialog
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onCreate={(data) => createProduct.mutateAsync(data)}
          onUpdate={(id, data) => updateProduct.mutateAsync({ id, data })}
        />
      </div>
      <DataTable
        columns={getProductColumns({ onEdit: (item) => setEditProduct(item as unknown as Product) })}
        data={products ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay productos registrados."
      />
    </div>
  )
}
