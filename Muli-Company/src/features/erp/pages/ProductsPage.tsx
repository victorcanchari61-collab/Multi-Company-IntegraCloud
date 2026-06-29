import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/data-table/DataTable'
import { CatalogFormDialog } from '../components/CatalogFormDialog'
import { ProductFormDialog } from '../components/ProductFormDialog'
import { UnitFormDialog } from '../components/UnitFormDialog'
import { PriceListFormDialog } from '../components/PriceListFormDialog'
import { CurrencyFormDialog } from '../components/CurrencyFormDialog'
import { getProductColumns, getCategoryColumns, getSubcategoryColumns, getBrandColumns, getSubbrandColumns } from '../components/catalog.columns'
import { getUnitColumns } from '../components/units.columns'
import { getPriceListColumns } from '../components/priceLists.columns'
import { getCurrencyColumns } from '../components/currencies.columns'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useSubcategories,
  useCreateSubcategory,
  useUpdateSubcategory,
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useSubbrands,
  useCreateSubbrand,
  useUpdateSubbrand,
} from '../queries/useProducts'
import { useUnits, useSetUnitStatus } from '../queries/useUnits'
import { usePriceLists, useCreatePriceList, useUpdatePriceList, useSetPriceListStatus } from '../queries/usePriceLists'
import { useCurrencies, useCreateCurrency, useUpdateCurrency, useSetCurrencyStatus } from '../queries/useCurrencies'
import type { Product, Category, Subcategory, Brand, Subbrand, UnitOfMeasure, PriceList, Currency } from '../types/erp'

export default function ProductsPage() {
  const { data: products, isLoading: loadingProducts } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const { data: categories, isLoading: loadingCategories } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  const { data: subcategories, isLoading: loadingSubcategories } = useSubcategories()
  const { data: catOptions } = useCategories()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()
  const [editSubcategory, setEditSubcategory] = useState<Subcategory | null>(null)
  const [subcatParent, setSubcatParent] = useState('')

  const { data: brands, isLoading: loadingBrands } = useBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const [editBrand, setEditBrand] = useState<Brand | null>(null)

  const { data: subbrands, isLoading: loadingSubbrands } = useSubbrands()
  const { data: brandOptions } = useBrands()
  const createSubbrand = useCreateSubbrand()
  const updateSubbrand = useUpdateSubbrand()
  const [editSubbrand, setEditSubbrand] = useState<Subbrand | null>(null)
  const [subbrandParent, setSubbrandParent] = useState('')

  const { data: units, isLoading: loadingUnits } = useUnits()
  const setUnitStatus = useSetUnitStatus()
  const [editUnit, setEditUnit] = useState<UnitOfMeasure | null>(null)

  const { data: priceLists, isLoading: loadingPriceLists } = usePriceLists()
  const createPriceList = useCreatePriceList()
  const updatePriceList = useUpdatePriceList()
  const setPriceListStatus = useSetPriceListStatus()
  const [editPriceList, setEditPriceList] = useState<PriceList | null>(null)

  const { data: currencies, isLoading: loadingCurrencies } = useCurrencies()
  const createCurrency = useCreateCurrency()
  const updateCurrency = useUpdateCurrency()
  const setCurrencyStatus = useSetCurrencyStatus()
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null)

  const onToggleUnit = (unit: UnitOfMeasure) =>
    setUnitStatus.mutate(
      { id: unit.id, active: !unit.isActive },
      { onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar') },
    )

  const unitColumns = useMemo(
    () => getUnitColumns({ pending: setUnitStatus.isPending, onEdit: setEditUnit, onToggleStatus: onToggleUnit }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUnitStatus.isPending],
  )

  const priceListColumns = useMemo(
    () => getPriceListColumns({
      pending: setPriceListStatus.isPending,
      onEdit: setEditPriceList,
      onToggleStatus: (pl) => setPriceListStatus.mutate({ id: pl.id, active: !pl.isActive }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setPriceListStatus.isPending],
  )

  const currencyColumns = useMemo(
    () => getCurrencyColumns({
      pending: setCurrencyStatus.isPending,
      onEdit: setEditCurrency,
      onToggleStatus: (c) => setCurrencyStatus.mutate({ id: c.id, active: !c.isActive }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setCurrencyStatus.isPending],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">Ficha maestra de productos del catálogo.</p>
      </div>

      <Tabs defaultValue="productos">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="productos" className="flex-1 min-w-[100px]">Productos</TabsTrigger>
          <TabsTrigger value="categorias" className="flex-1 min-w-[100px]">Categorías</TabsTrigger>
          <TabsTrigger value="marcas" className="flex-1 min-w-[100px]">Marcas</TabsTrigger>
          <TabsTrigger value="subcategorias" className="flex-1 min-w-[100px]">Subcategorías</TabsTrigger>
          <TabsTrigger value="submarcas" className="flex-1 min-w-[100px]">Submarcas</TabsTrigger>
          <TabsTrigger value="unidades" className="flex-1 min-w-[100px]">Unidades</TabsTrigger>
          <TabsTrigger value="precios" className="flex-1 min-w-[100px]">Listas de precio</TabsTrigger>
          <TabsTrigger value="monedas" className="flex-1 min-w-[100px]">Monedas</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-4 pt-4">
          <div className="flex justify-end">
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
            loading={loadingProducts}
            getRowId={(r) => r.id}
            mobileTitle={(r) => r.name}
            emptyMessage="No hay productos registrados."
          />
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <CatalogFormDialog<Category>
              entity={editCategory}
              onClose={() => setEditCategory(null)}
              onCreate={(data) => createCategory.mutateAsync(data)}
              onUpdate={(id, data) => updateCategory.mutateAsync({ id, data })}
              title="Categoría"
              description="Agrupa productos por tipo general."
              triggerLabel="Nueva categoría"
            />
          </div>
          <DataTable
            columns={getCategoryColumns({ onEdit: (item) => setEditCategory(item as Category) })}
            data={categories ?? []}
            loading={loadingCategories}
            getRowId={(r) => r.id}
            mobileTitle={(r) => r.name}
            emptyMessage="No hay categorías registradas."
          />
        </TabsContent>

        <TabsContent value="marcas" className="space-y-4 pt-4">
          <div className="flex justify-end">
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
            loading={loadingBrands}
            getRowId={(r) => r.id}
            mobileTitle={(r) => r.name}
            emptyMessage="No hay marcas registradas."
          />
        </TabsContent>

        <TabsContent value="subcategorias" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <CatalogFormDialog<Subcategory>
              entity={editSubcategory}
              onClose={() => {
                setEditSubcategory(null)
                setSubcatParent('')
              }}
              onCreate={(data) =>
                createSubcategory.mutateAsync({ ...data, categoryId: subcatParent, description: data.description })
              }
              onUpdate={(id, data) =>
                updateSubcategory.mutateAsync({ id, data: { ...data, categoryId: editSubcategory?.categoryId ?? '' } })
              }
              title="Subcategoría"
              description="Subdivisión de una categoría existente."
              triggerLabel="Nueva subcategoría"
              parentField={
                editSubcategory
                  ? undefined
                  : {
                      label: 'Categoría',
                      value: subcatParent,
                      onChange: setSubcatParent,
                      options: (catOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
                    }
              }
            />
          </div>
          <DataTable
            columns={getSubcategoryColumns({ onEdit: (item) => setEditSubcategory(item as Subcategory) })}
            data={subcategories ?? []}
            loading={loadingSubcategories}
            getRowId={(r) => r.id}
            mobileTitle={(r) => r.name}
            emptyMessage="No hay subcategorías registradas."
          />
        </TabsContent>

        <TabsContent value="submarcas" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <CatalogFormDialog<Subbrand>
              entity={editSubbrand}
              onClose={() => {
                setEditSubbrand(null)
                setSubbrandParent('')
              }}
              onCreate={(data) =>
                createSubbrand.mutateAsync({ ...data, brandId: subbrandParent, description: data.description })
              }
              onUpdate={(id, data) =>
                updateSubbrand.mutateAsync({ id, data: { ...data, brandId: editSubbrand?.brandId ?? '' } })
              }
              title="Submarca"
              description="Subdivisión de una marca existente."
              triggerLabel="Nueva submarca"
              parentField={
                editSubbrand
                  ? undefined
                  : {
                      label: 'Marca',
                      value: subbrandParent,
                      onChange: setSubbrandParent,
                      options: (brandOptions ?? []).map((b) => ({ value: b.id, label: b.name })),
                    }
              }
            />
          </div>
          <DataTable
            columns={getSubbrandColumns({ onEdit: (item) => setEditSubbrand(item as Subbrand) })}
            data={subbrands ?? []}
            loading={loadingSubbrands}
            getRowId={(r) => r.id}
            mobileTitle={(r) => r.name}
            emptyMessage="No hay submarcas registradas."
          />
        </TabsContent>

        <TabsContent value="unidades" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <UnitFormDialog />
          </div>
          <DataTable
            columns={unitColumns}
            data={units ?? []}
            loading={loadingUnits}
            getRowId={(u) => u.id}
            mobileTitle={(u) => u.name}
            emptyMessage="No hay unidades registradas."
          />
          {editUnit && <UnitFormDialog unit={editUnit} onClose={() => setEditUnit(null)} />}
        </TabsContent>

        <TabsContent value="precios" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <PriceListFormDialog
              priceList={editPriceList}
              onClose={() => setEditPriceList(null)}
              onCreate={(data) => createPriceList.mutateAsync(data)}
              onUpdate={(id, data) => updatePriceList.mutateAsync({ id, data })}
            />
          </div>
          <DataTable
            columns={priceListColumns}
            data={priceLists ?? []}
            loading={loadingPriceLists}
            getRowId={(pl) => pl.id}
            mobileTitle={(pl) => pl.name}
            emptyMessage="No hay listas de precios registradas."
          />
          {editPriceList && (
            <PriceListFormDialog
              priceList={editPriceList}
              onClose={() => setEditPriceList(null)}
              onCreate={(data) => createPriceList.mutateAsync(data)}
              onUpdate={(id, data) => updatePriceList.mutateAsync({ id, data })}
            />
          )}
        </TabsContent>

        <TabsContent value="monedas" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <CurrencyFormDialog
              currency={editCurrency}
              onClose={() => setEditCurrency(null)}
              onCreate={(data) => createCurrency.mutateAsync(data)}
              onUpdate={(id, data) => updateCurrency.mutateAsync({ id, data })}
            />
          </div>
          <DataTable
            columns={currencyColumns}
            data={currencies ?? []}
            loading={loadingCurrencies}
            getRowId={(c) => c.id}
            mobileTitle={(c) => c.name}
            emptyMessage="No hay monedas registradas."
          />
          {editCurrency && (
            <CurrencyFormDialog
              currency={editCurrency}
              onClose={() => setEditCurrency(null)}
              onCreate={(data) => createCurrency.mutateAsync(data)}
              onUpdate={(id, data) => updateCurrency.mutateAsync({ id, data })}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
