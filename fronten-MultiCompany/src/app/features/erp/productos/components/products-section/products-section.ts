import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { ColumnDef } from '@tanstack/angular-table';
import { LucidePencil } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { Badge } from '@/app/shared/ui/badge/badge';
import { DataTable } from '@/app/shared/ui/data-table/data-table';
import { DataTableCell, DataTableMobileTitle } from '@/app/shared/ui/data-table/data-table-cell.directive';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { SearchInput } from '@/app/shared/ui/search-input/search-input';
import type { Product } from '../../models/catalog.model';
import { ErpProductsService } from '../../services/erp-products.service';
import { ProductFormDialog } from '../product-form-dialog/product-form-dialog';

const COLUMNS: ColumnDef<Product, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Nombre' },
  { id: 'sku', accessorKey: 'sku', header: 'SKU', size: 110 },
  { id: 'categoryName', accessorKey: 'categoryName', header: 'Categoría', size: 130 },
  { id: 'brandName', accessorKey: 'brandName', header: 'Marca', size: 130 },
  { id: 'salePrice', accessorKey: 'salePrice', header: 'Precio venta', size: 110 },
  { id: 'status', accessorKey: 'isActive', header: 'Estado', size: 100 },
  { id: 'actions', header: 'Acciones', size: 80, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-products-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    CanDirective,
    Badge,
    DataTable,
    DataTableCell,
    DataTableMobileTitle,
    ButtonDirective,
    SearchInput,
    ProductFormDialog,
    LucidePencil,
  ],
  templateUrl: './products-section.html',
})
export class ProductsSection {
  private readonly productsService = inject(ErpProductsService);

  protected readonly columns = COLUMNS;
  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = signal('');

  private readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly dialogOpen = signal(false);
  protected readonly editingProduct = signal<Product | null>(null);

  protected readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.products();
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.sku ?? '').toLowerCase().includes(query) ||
        (product.barcode ?? '').toLowerCase().includes(query),
    );
  });

  protected readonly stats = computed(() => {
    const all = this.products();
    const active = all.filter((product) => product.isActive).length;
    return { total: all.length, active, inactive: all.length - active };
  });

  constructor() {
    void this.loadProducts();
    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  protected async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.products.set(await firstValueFrom(this.productsService.getProducts()));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los productos.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openCreate(): void {
    this.editingProduct.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(product: Product): void {
    this.editingProduct.set(product);
    this.dialogOpen.set(true);
  }
}
