import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { type Observable, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { ColumnDef } from '@tanstack/angular-table';
import { LucidePencil } from '@lucide/angular';
import { input } from '@angular/core';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { Badge } from '@/app/shared/ui/badge/badge';
import { DataTable } from '@/app/shared/ui/data-table/data-table';
import { DataTableCell, DataTableMobileTitle } from '@/app/shared/ui/data-table/data-table-cell.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Input } from '@/app/shared/ui/input/input';
import { SearchInput } from '@/app/shared/ui/search-input/search-input';

/** Fila normalizada de un maestro simple (categoría, marca, subcategoría, submarca). */
export interface SimpleCatalogItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  parentId?: string;
  parentName?: string;
}

export interface SimpleCatalogPayload {
  name: string;
  description: string | null;
  parentId: string | null;
}

/** Adaptador que cada pestaña del catálogo le pasa a la sección genérica. */
export interface SimpleCatalogConfig {
  /** Nombre singular con artículo, ej. "la categoría" (para mensajes). */
  entityName: string;
  /** Título del botón crear, ej. "Nueva categoría". */
  createLabel: string;
  createPermission: string;
  updatePermission: string;
  load: () => Observable<SimpleCatalogItem[]>;
  create: (payload: SimpleCatalogPayload) => Observable<unknown>;
  update: (id: string, payload: SimpleCatalogPayload) => Observable<unknown>;
  /** Presente solo en entidades con padre (subcategoría → categoría, submarca → marca). */
  parent?: {
    label: string;
    loadOptions: () => Observable<{ id: string; name: string }[]>;
  };
}

/**
 * Sección genérica para maestros nombre + descripción (+ padre opcional) del catálogo:
 * stats, búsqueda, tabla y diálogo crear/editar en un solo componente reutilizable.
 * Las pestañas solo arman un SimpleCatalogConfig — cero UI duplicada por entidad.
 */
@Component({
  selector: 'app-simple-catalog-section',
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
  ],
  templateUrl: './simple-catalog-section.html',
})
export class SimpleCatalogSection {
  readonly config = input.required<SimpleCatalogConfig>();

  private readonly fb = inject(FormBuilder);

  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = signal('');

  private readonly items = signal<SimpleCatalogItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<SimpleCatalogItem | null>(null);
  protected readonly saving = signal(false);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly parentOptions = signal<{ id: string; name: string }[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
    parentId: this.fb.control<string | null>(null),
  });

  protected readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description ?? '').toLowerCase().includes(query) ||
        (item.parentName ?? '').toLowerCase().includes(query),
    );
  });

  protected readonly stats = computed(() => {
    const all = this.items();
    const active = all.filter((item) => item.isActive).length;
    return { total: all.length, active, inactive: all.length - active };
  });

  protected readonly columns = computed<ColumnDef<SimpleCatalogItem, unknown>[]>(() => {
    const cols: ColumnDef<SimpleCatalogItem, unknown>[] = [];
    const parent = this.config().parent;
    if (parent) cols.push({ id: 'parentName', accessorKey: 'parentName', header: parent.label, size: 140 });
    cols.push(
      { id: 'name', accessorKey: 'name', header: 'Nombre' },
      { id: 'description', accessorKey: 'description', header: 'Descripción' },
      { id: 'status', accessorKey: 'isActive', header: 'Estado', size: 100 },
      { id: 'actions', header: 'Acciones', size: 80, enableSorting: false, enableColumnFilter: false },
    );
    return cols;
  });

  constructor() {
    // La sección se monta al entrar a su pestaña: carga cuando llega el config.
    effect(() => {
      this.config();
      void this.loadItems();
    });

    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  protected async loadItems(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.items.set(await firstValueFrom(this.config().load()));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los datos.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async openCreate(): Promise<void> {
    this.editing.set(null);
    this.form.reset({ name: '', description: '', parentId: null });
    this.dialogError.set(null);
    this.dialogOpen.set(true);
    await this.loadParentOptions();
  }

  protected async openEdit(item: SimpleCatalogItem): Promise<void> {
    this.editing.set(item);
    this.form.reset({ name: item.name, description: item.description ?? '', parentId: item.parentId ?? null });
    this.dialogError.set(null);
    this.dialogOpen.set(true);
    await this.loadParentOptions();
  }

  private async loadParentOptions(): Promise<void> {
    const parent = this.config().parent;
    if (!parent) return;
    try {
      this.parentOptions.set(await firstValueFrom(parent.loadOptions()));
    } catch {
      this.parentOptions.set([]);
    }
  }

  protected async onSubmit(): Promise<void> {
    const config = this.config();
    const { name, description, parentId } = this.form.getRawValue();
    if (this.form.invalid || (config.parent && !parentId)) {
      this.form.markAllAsTouched();
      if (config.parent && !parentId) this.dialogError.set(`Selecciona ${config.parent.label.toLowerCase()}.`);
      return;
    }

    this.dialogError.set(null);
    this.saving.set(true);
    const payload: SimpleCatalogPayload = { name, description: description.trim() || null, parentId };

    try {
      const editing = this.editing();
      if (editing) await firstValueFrom(config.update(editing.id, payload));
      else await firstValueFrom(config.create(payload));
      this.dialogOpen.set(false);
      await this.loadItems();
    } catch (error) {
      this.dialogError.set(error instanceof ApiError ? error.message : `No se pudo guardar ${config.entityName}.`);
    } finally {
      this.saving.set(false);
    }
  }
}
