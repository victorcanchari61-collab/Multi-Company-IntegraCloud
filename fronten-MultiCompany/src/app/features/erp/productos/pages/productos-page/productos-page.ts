import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import {
  LucideBanknote,
  LucideBookmark,
  LucideBox,
  LucideCoins,
  LucideLayers,
  LucideListTree,
  LucideRuler,
  LucideTag,
} from '@lucide/angular';
import { type TabItem, Tabs } from '@/app/shared/ui/tabs/tabs';
import { TabIcon } from '@/app/shared/ui/tabs/tab-icon.directive';
import {
  type SimpleCatalogConfig,
  SimpleCatalogSection,
} from '../../components/simple-catalog-section/simple-catalog-section';
import { CurrenciesSection } from '../../components/currencies-section/currencies-section';
import { PriceListsSection } from '../../components/price-lists-section/price-lists-section';
import { ProductsSection } from '../../components/products-section/products-section';
import { UnitsSection } from '../../components/units-section/units-section';
import { CatalogService } from '../../services/catalog.service';

type CatalogTab =
  | 'productos'
  | 'categorias'
  | 'marcas'
  | 'subcategorias'
  | 'submarcas'
  | 'unidades'
  | 'precios'
  | 'monedas';

// Mismo orden que el hub de referencia en React.
const TABS: TabItem[] = [
  { key: 'productos', label: 'Productos' },
  { key: 'categorias', label: 'Categorías' },
  { key: 'marcas', label: 'Marcas' },
  { key: 'subcategorias', label: 'Subcategorías' },
  { key: 'submarcas', label: 'Submarcas' },
  { key: 'unidades', label: 'Unidades' },
  { key: 'precios', label: 'Listas de precio' },
  { key: 'monedas', label: 'Monedas' },
];

@Component({
  selector: 'app-productos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Tabs,
    TabIcon,
    ProductsSection,
    SimpleCatalogSection,
    UnitsSection,
    PriceListsSection,
    CurrenciesSection,
    LucideBox,
    LucideTag,
    LucideBookmark,
    LucideListTree,
    LucideLayers,
    LucideRuler,
    LucideBanknote,
    LucideCoins,
  ],
  templateUrl: './productos-page.html',
})
export class ProductosPage {
  private readonly catalog = inject(CatalogService);

  protected readonly tabs = TABS;
  protected readonly activeTab = signal<CatalogTab>('productos');

  protected setTab(tab: string): void {
    this.activeTab.set(tab as CatalogTab);
  }

  // Config de cada maestro simple: la sección genérica pone toda la UI, acá solo se cablea.
  protected readonly categoriesConfig: SimpleCatalogConfig = {
    entityName: 'categoría',
    createLabel: 'Nueva categoría',
    createPermission: 'erp.productos.create',
    updatePermission: 'erp.productos.update',
    load: () => this.catalog.getCategories(),
    create: (p) => this.catalog.createCategory({ name: p.name, description: p.description }),
    update: (id, p) => this.catalog.updateCategory(id, { name: p.name, description: p.description }),
  };

  protected readonly brandsConfig: SimpleCatalogConfig = {
    entityName: 'marca',
    createLabel: 'Nueva marca',
    createPermission: 'erp.productos.create',
    updatePermission: 'erp.productos.update',
    load: () => this.catalog.getBrands(),
    create: (p) => this.catalog.createBrand({ name: p.name, description: p.description }),
    update: (id, p) => this.catalog.updateBrand(id, { name: p.name, description: p.description }),
  };

  protected readonly subcategoriesConfig: SimpleCatalogConfig = {
    entityName: 'subcategoría',
    createLabel: 'Nueva subcategoría',
    createPermission: 'erp.productos.create',
    updatePermission: 'erp.productos.update',
    load: () =>
      this.catalog.getSubcategories().pipe(
        map((items) =>
          items.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            isActive: s.isActive,
            parentId: s.categoryId,
            parentName: s.categoryName,
          })),
        ),
      ),
    create: (p) => this.catalog.createSubcategory({ categoryId: p.parentId!, name: p.name, description: p.description }),
    update: (id, p) =>
      this.catalog.updateSubcategory(id, { categoryId: p.parentId!, name: p.name, description: p.description }),
    parent: {
      label: 'Categoría',
      loadOptions: () =>
        this.catalog.getCategories().pipe(map((categories) => categories.filter((c) => c.isActive))),
    },
  };

  protected readonly subbrandsConfig: SimpleCatalogConfig = {
    entityName: 'submarca',
    createLabel: 'Nueva submarca',
    createPermission: 'erp.productos.create',
    updatePermission: 'erp.productos.update',
    load: () =>
      this.catalog.getSubbrands().pipe(
        map((items) =>
          items.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            isActive: s.isActive,
            parentId: s.brandId,
            parentName: s.brandName,
          })),
        ),
      ),
    create: (p) => this.catalog.createSubbrand({ brandId: p.parentId!, name: p.name, description: p.description }),
    update: (id, p) =>
      this.catalog.updateSubbrand(id, { brandId: p.parentId!, name: p.name, description: p.description }),
    parent: {
      label: 'Marca',
      loadOptions: () => this.catalog.getBrands().pipe(map((brands) => brands.filter((b) => b.isActive))),
    },
  };
}
