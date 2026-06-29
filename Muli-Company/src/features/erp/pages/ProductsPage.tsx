import { useState } from 'react'
import { Boxes, FolderTree, ListTree, ShieldCheck, Tags } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../components/CatalogFormDialog'
import { ProductFormDialog } from '../components/ProductFormDialog'
import {
  getBrandColumns,
  getCategoryColumns,
  getProductColumns,
  getSubbrandColumns,
  getSubcategoryColumns,
} from '../components/catalog.columns'
import {
  useBrands,
  useCategories,
  useCreateBrand,
  useCreateCategory,
  useCreateProduct,
  useCreateSubbrand,
  useCreateSubcategory,
  useProducts,
  useSubbrands,
  useSubcategories,
  useUpdateBrand,
  useUpdateCategory,
  useUpdateProduct,
  useUpdateSubbrand,
  useUpdateSubcategory,
} from '../queries/useProducts'
import type {
  Brand,
  Category,
  Product,
  Subbrand,
  Subcategory,
} from '../types/erp'

export default function ProductsPage() {
  const [tab, setTab] = useState('categories')

  // ── Categorías ──
  const { data: categories, isLoading: catLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [editCat, setEditCat] = useState<Category | null>(null)

  // ── Subcategorías ──
  const { data: subcategories, isLoading: subcatLoading } = useSubcategories()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()
  const [editSubcat, setEditSubcat] = useState<Subcategory | null>(null)
  const [subcatParent, setSubcatParent] = useState('')

  // ── Marcas ──
  const { data: brands, isLoading: brandLoading } = useBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const [editBrand, setEditBrand] = useState<Brand | null>(null)

  // ── Submarcas ──
  const { data: subbrands, isLoading: subbrandLoading } = useSubbrands()
  const createSubbrand = useCreateSubbrand()
  const updateSubbrand = useUpdateSubbrand()
  const [editSubbrand, setEditSubbrand] = useState<Subbrand | null>(null)
  const [subbrandParent, setSubbrandParent] = useState('')

  // ── Productos ──
  const { data: products, isLoading: productLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Catálogo de productos</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona las categorías, marcas y productos del catálogo.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="categories">
            <FolderTree className="size-4" /> Categorías
          </TabsTrigger>
          <TabsTrigger value="subcategories">
            <ListTree className="size-4" /> Subcategorías
          </TabsTrigger>
          <TabsTrigger value="brands">
            <Tags className="size-4" /> Marcas
          </TabsTrigger>
          <TabsTrigger value="subbrands">
            <ShieldCheck className="size-4" /> Submarcas
          </TabsTrigger>
          <TabsTrigger value="products">
            <Boxes className="size-4" /> Productos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Clasificación general de productos (ej: Alimentos, Electrónicos, Vestimenta).
              </p>
              <CatalogFormDialog<Category>
                entity={editCat}
                onClose={() => setEditCat(null)}
                onCreate={(data) => createCategory.mutateAsync(data)}
                onUpdate={(id, data) => updateCategory.mutateAsync({ id, data })}
                title="Categoría"
                description="Agrupa productos por tipo general."
                triggerLabel="Nueva categoría"
              />
            </div>
            <DataTable
              columns={getCategoryColumns({ onEdit: (item) => setEditCat(item as Category) })}
              data={categories ?? []}
              loading={catLoading}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.name}
              emptyMessage="No hay categorías registradas."
            />
          </div>
        </TabsContent>

        <TabsContent value="subcategories" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Subclasificación dentro de una categoría (ej: Lácteos dentro de Alimentos).
              </p>
              <CatalogFormDialog<Subcategory>
                entity={editSubcat}
                onClose={() => { setEditSubcat(null); setSubcatParent('') }}
                onCreate={(data) => createSubcategory.mutateAsync({
                  ...data,
                  categoryId: subcatParent,
                  description: data.description,
                })}
                onUpdate={(id, data) => updateSubcategory.mutateAsync({
                  id,
                  data: { ...data, categoryId: editSubcat?.categoryId ?? '' },
                })}
                title="Subcategoría"
                description="Subdivisión de una categoría existente."
                triggerLabel="Nueva subcategoría"
                parentField={editSubcat ? undefined : {
                  label: 'Categoría',
                  value: subcatParent,
                  onChange: setSubcatParent,
                  options: (categories ?? []).map((c) => ({ value: c.id, label: c.name })),
                }}
              />
            </div>
            <DataTable
              columns={getSubcategoryColumns({ onEdit: (item) => setEditSubcat(item as Subcategory) })}
              data={subcategories ?? []}
              loading={subcatLoading}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.name}
              emptyMessage="No hay subcategorías registradas."
            />
          </div>
        </TabsContent>

        <TabsContent value="brands" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Marcas de productos (ej: Sony, Nike, Samsung).
              </p>
              <CatalogFormDialog<Brand>
                entity={editBrand}
                onClose={() => setEditBrand(null)}
                onCreate={(data) => createBrand.mutateAsync(data)}
                onUpdate={(id, data) => updateBrand.mutateAsync({ id, data })}
                title="Marca"
                description="Registra las marcas disponibles en el catálogo."
                triggerLabel="Nueva marca"
              />
            </div>
            <DataTable
              columns={getBrandColumns({ onEdit: (item) => setEditBrand(item as Brand) })}
              data={brands ?? []}
              loading={brandLoading}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.name}
              emptyMessage="No hay marcas registradas."
            />
          </div>
        </TabsContent>

        <TabsContent value="subbrands" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Subdivisiones dentro de una marca (ej: Nike Air, Nike SB).
              </p>
              <CatalogFormDialog<Subbrand>
                entity={editSubbrand}
                onClose={() => { setEditSubbrand(null); setSubbrandParent('') }}
                onCreate={(data) => createSubbrand.mutateAsync({
                  ...data,
                  brandId: subbrandParent,
                  description: data.description,
                })}
                onUpdate={(id, data) => updateSubbrand.mutateAsync({
                  id,
                  data: { ...data, brandId: editSubbrand?.brandId ?? '' },
                })}
                title="Submarca"
                description="Subdivisión de una marca existente."
                triggerLabel="Nueva submarca"
                parentField={editSubbrand ? undefined : {
                  label: 'Marca',
                  value: subbrandParent,
                  onChange: setSubbrandParent,
                  options: (brands ?? []).map((b) => ({ value: b.id, label: b.name })),
                }}
              />
            </div>
            <DataTable
              columns={getSubbrandColumns({ onEdit: (item) => setEditSubbrand(item as Subbrand) })}
              data={subbrands ?? []}
              loading={subbrandLoading}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.name}
              emptyMessage="No hay submarcas registradas."
            />
          </div>
        </TabsContent>

        <TabsContent value="products" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Ficha maestra de productos del catálogo.
              </p>
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
              loading={productLoading}
              getRowId={(r) => r.id}
              mobileTitle={(r) => r.name}
              emptyMessage="No hay productos registrados."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
