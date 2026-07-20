import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductsSection } from '../sections/catalog/ProductsSection'
import { CategoriesSection } from '../sections/catalog/CategoriesSection'
import { SubcategoriesSection } from '../sections/catalog/SubcategoriesSection'
import { BrandsSection } from '../sections/catalog/BrandsSection'
import { SubbrandsSection } from '../sections/catalog/SubbrandsSection'
import { UnitsSection } from '../sections/catalog/UnitsSection'
import { PriceListsSection } from '../sections/catalog/PriceListsSection'
import { CurrenciesSection } from '../sections/catalog/CurrenciesSection'

const TABS = [
  { value: 'productos', label: 'Productos', Section: ProductsSection },
  { value: 'categorias', label: 'Categorías', Section: CategoriesSection },
  { value: 'marcas', label: 'Marcas', Section: BrandsSection },
  { value: 'subcategorias', label: 'Subcategorías', Section: SubcategoriesSection },
  { value: 'submarcas', label: 'Submarcas', Section: SubbrandsSection },
  { value: 'unidades', label: 'Unidades', Section: UnitsSection },
  { value: 'precios', label: 'Listas de precio', Section: PriceListsSection },
  { value: 'monedas', label: 'Monedas', Section: CurrenciesSection },
] as const

/** SMART · la página SOLO orquesta: pestañas → su sección. */
export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Catálogo de productos</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona productos y sus maestros: categorías, marcas, unidades, precios y monedas.
        </p>
      </div>

      <Tabs defaultValue="productos">
        <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="min-w-[92px] flex-1">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value, Section }) => (
          <TabsContent key={value} value={value} className="pt-4">
            <Section />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
