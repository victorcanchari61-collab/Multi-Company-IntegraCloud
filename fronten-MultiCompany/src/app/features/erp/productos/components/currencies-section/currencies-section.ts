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
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Input } from '@/app/shared/ui/input/input';
import { SearchInput } from '@/app/shared/ui/search-input/search-input';
import type { Currency } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';

const COLUMNS: ColumnDef<Currency, unknown>[] = [
  { id: 'code', accessorKey: 'code', header: 'Código', size: 90 },
  { id: 'name', accessorKey: 'name', header: 'Nombre' },
  { id: 'symbol', accessorKey: 'symbol', header: 'Símbolo', size: 90 },
  { id: 'status', accessorKey: 'isActive', header: 'Estado', size: 100 },
  { id: 'actions', header: 'Acciones', size: 100, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-currencies-section',
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
    LabelDirective,
    SearchInput,
    LucidePencil,
    LucideBan,
    LucidePower,
  ],
  templateUrl: './currencies-section.html',
})
export class CurrenciesSection {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly columns = COLUMNS;
  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = signal('');

  private readonly currencies = signal<Currency[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Currency | null>(null);
  protected readonly saving = signal(false);
  protected readonly dialogError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(3)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    symbol: ['', [Validators.maxLength(5)]],
  });

  protected readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.currencies();
    return this.currencies().filter(
      (currency) => currency.name.toLowerCase().includes(query) || currency.code.toLowerCase().includes(query),
    );
  });

  protected readonly stats = computed(() => {
    const all = this.currencies();
    const active = all.filter((currency) => currency.isActive).length;
    return { total: all.length, active, inactive: all.length - active };
  });

  constructor() {
    void this.loadCurrencies();
    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  protected async loadCurrencies(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.currencies.set(await firstValueFrom(this.catalog.getCurrencies()));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar las monedas.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.form.reset({ code: '', name: '', symbol: '' });
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(currency: Currency): void {
    this.editing.set(currency);
    this.form.reset({ code: currency.code, name: currency.name, symbol: currency.symbol ?? '' });
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
    const payload = { code: raw.code.toUpperCase(), name: raw.name, symbol: raw.symbol.trim() || null };

    try {
      const editing = this.editing();
      if (editing) await firstValueFrom(this.catalog.updateCurrency(editing.id, payload));
      else await firstValueFrom(this.catalog.createCurrency(payload));
      this.dialogOpen.set(false);
      await this.loadCurrencies();
    } catch (error) {
      this.dialogError.set(error instanceof ApiError ? error.message : 'No se pudo guardar la moneda.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async toggleStatus(currency: Currency): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      currency.isActive ? `¿Desactivar la moneda "${currency.code}"?` : `¿Activar la moneda "${currency.code}"?`,
      currency.isActive ? 'Desactivar moneda' : 'Activar moneda',
    );
    if (!confirmed) return;

    try {
      await firstValueFrom(this.catalog.setCurrencyStatus(currency.id, !currency.isActive));
      await this.loadCurrencies();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo actualizar el estado.');
    }
  }
}
