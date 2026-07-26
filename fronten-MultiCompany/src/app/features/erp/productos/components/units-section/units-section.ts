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
import type { UnitOfMeasure } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';

const COLUMNS: ColumnDef<UnitOfMeasure, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Nombre' },
  { id: 'abbreviation', accessorKey: 'abbreviation', header: 'Abreviatura', size: 120 },
  { id: 'status', accessorKey: 'isActive', header: 'Estado', size: 100 },
  { id: 'actions', header: 'Acciones', size: 100, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-units-section',
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
  templateUrl: './units-section.html',
})
export class UnitsSection {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly columns = COLUMNS;
  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = signal('');

  private readonly units = signal<UnitOfMeasure[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<UnitOfMeasure | null>(null);
  protected readonly saving = signal(false);
  protected readonly dialogError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    abbreviation: ['', [Validators.required, Validators.maxLength(10)]],
  });

  protected readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.units();
    return this.units().filter(
      (unit) => unit.name.toLowerCase().includes(query) || unit.abbreviation.toLowerCase().includes(query),
    );
  });

  protected readonly stats = computed(() => {
    const all = this.units();
    const active = all.filter((unit) => unit.isActive).length;
    return { total: all.length, active, inactive: all.length - active };
  });

  constructor() {
    void this.loadUnits();
    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  protected async loadUnits(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.units.set(await firstValueFrom(this.catalog.getUnits()));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar las unidades.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', abbreviation: '' });
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(unit: UnitOfMeasure): void {
    this.editing.set(unit);
    this.form.reset({ name: unit.name, abbreviation: unit.abbreviation });
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
    const payload = this.form.getRawValue();

    try {
      const editing = this.editing();
      if (editing) await firstValueFrom(this.catalog.updateUnit(editing.id, payload));
      else await firstValueFrom(this.catalog.createUnit(payload));
      this.dialogOpen.set(false);
      await this.loadUnits();
    } catch (error) {
      this.dialogError.set(error instanceof ApiError ? error.message : 'No se pudo guardar la unidad.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async toggleStatus(unit: UnitOfMeasure): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      unit.isActive ? `¿Desactivar la unidad "${unit.name}"?` : `¿Activar la unidad "${unit.name}"?`,
      unit.isActive ? 'Desactivar unidad' : 'Activar unidad',
    );
    if (!confirmed) return;

    try {
      await firstValueFrom(this.catalog.setUnitStatus(unit.id, !unit.isActive));
      await this.loadUnits();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo actualizar el estado.');
    }
  }
}
