import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { ColumnDef } from '@tanstack/angular-table';
import { LucideBan, LucidePencil, LucidePower } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { ConfirmService } from '@/app/shared/confirm/confirm.service';
import { Badge } from '@/app/shared/ui/badge/badge';
import { DataTable } from '@/app/shared/ui/data-table/data-table';
import { DataTableCell, DataTableMobileTitle } from '@/app/shared/ui/data-table/data-table-cell.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Input } from '@/app/shared/ui/input/input';
import { SearchInput } from '@/app/shared/ui/search-input/search-input';
import type { PriceList } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';

const TYPE_LABELS: Record<string, string> = {
  purchase: 'Compra',
  sale: 'Venta',
  both: 'Ambos',
};

const COLUMNS: ColumnDef<PriceList, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Nombre' },
  { id: 'description', accessorKey: 'description', header: 'Descripción' },
  { id: 'type', accessorKey: 'type', header: 'Tipo', size: 100 },
  { id: 'status', accessorKey: 'isActive', header: 'Estado', size: 100 },
  { id: 'actions', header: 'Acciones', size: 100, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-price-lists-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CanDirective,
    Badge,
    DataTable,
    DataTableCell,
    DataTableMobileTitle,
    Dialog,
    ButtonDirective,
    Input,
    InputDirective,
    LabelDirective,
    SearchInput,
    LucidePencil,
    LucideBan,
    LucidePower,
  ],
  templateUrl: './price-lists-section.html',
})
export class PriceListsSection {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly columns = COLUMNS;
  protected readonly typeLabels = TYPE_LABELS;
  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = signal('');

  private readonly priceLists = signal<PriceList[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<PriceList | null>(null);
  protected readonly saving = signal(false);
  protected readonly dialogError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
    type: ['both', [Validators.required]],
  });

  protected readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.priceLists();
    return this.priceLists().filter(
      (list) => list.name.toLowerCase().includes(query) || (list.description ?? '').toLowerCase().includes(query),
    );
  });

  protected readonly stats = computed(() => {
    const all = this.priceLists();
    const active = all.filter((list) => list.isActive).length;
    return { total: all.length, active, inactive: all.length - active };
  });

  constructor() {
    void this.loadPriceLists();
    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  protected async loadPriceLists(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.priceLists.set(await firstValueFrom(this.catalog.getPriceLists()));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar las listas de precio.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', description: '', type: 'both' });
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(priceList: PriceList): void {
    this.editing.set(priceList);
    this.form.reset({ name: priceList.name, description: priceList.description ?? '', type: priceList.type });
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogError.set(null);
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload = { name: raw.name, description: raw.description.trim() || null, type: raw.type };

    try {
      const editing = this.editing();
      if (editing) await firstValueFrom(this.catalog.updatePriceList(editing.id, payload));
      else await firstValueFrom(this.catalog.createPriceList(payload));
      this.dialogOpen.set(false);
      await this.loadPriceLists();
    } catch (error) {
      this.dialogError.set(error instanceof ApiError ? error.message : 'No se pudo guardar la lista de precio.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async toggleStatus(priceList: PriceList): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      priceList.isActive ? `¿Desactivar la lista "${priceList.name}"?` : `¿Activar la lista "${priceList.name}"?`,
      priceList.isActive ? 'Desactivar lista de precio' : 'Activar lista de precio',
    );
    if (!confirmed) return;

    try {
      await firstValueFrom(this.catalog.setPriceListStatus(priceList.id, !priceList.isActive));
      await this.loadPriceLists();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo actualizar el estado.');
    }
  }
}
