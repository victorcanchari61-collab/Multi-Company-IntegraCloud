import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, contentChildren, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type SortingState,
  type Updater,
  type VisibilityState,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/angular-table';
import { LucideArrowDown, LucideArrowUp, LucideArrowUpDown, LucideListFilter, LucideSlidersHorizontal } from '@lucide/angular';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { CheckboxDirective } from '@/app/shared/ui/directives/checkbox.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { SkeletonDirective } from '@/app/shared/ui/directives/skeleton.directive';
import { DataTableCell, DataTableMobileTitle } from './data-table-cell.directive';

declare module '@tanstack/angular-table' {
  interface ColumnMeta<TData, TValue> {
    label?: string;
    hideOnMobile?: boolean;
  }
}

function resolveUpdater<T>(updater: Updater<T>, old: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(old) : updater;
}

/**
 * Tabla genérica con ordenamiento, filtro por columna, redimensionar y mostrar/ocultar columnas
 * (motor TanStack Table, liviano — sin drag & drop de columnas para no traer @angular/cdk).
 * El contenido de cada celda se define por fuera proyectando <ng-template appCell="id" let-row>:
 * la tabla solo aporta el "chrome".
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ButtonDirective,
    CheckboxDirective,
    InputDirective,
    SkeletonDirective,
    LucideArrowDown,
    LucideArrowUp,
    LucideArrowUpDown,
    LucideListFilter,
    LucideSlidersHorizontal,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<TData> {
  readonly columns = input.required<ColumnDef<TData, unknown>[]>();
  readonly data = input.required<TData[]>();
  readonly loading = input(false);
  readonly emptyMessage = input('No hay registros.');
  readonly getRowId = input<((row: TData) => string) | undefined>(undefined);
  readonly rowClick = output<TData>();

  private readonly cellTemplateRefs = contentChildren(DataTableCell);
  protected readonly mobileTitleTemplate = contentChild(DataTableMobileTitle);

  protected readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<{ $implicit: unknown }>>();
    for (const t of this.cellTemplateRefs()) map.set(t.appCell(), t.templateRef);
    return map;
  });

  private readonly columnVisibility = signal<VisibilityState>({});
  private readonly sorting = signal<SortingState>([]);
  private readonly columnSizing = signal<ColumnSizingState>({});
  private readonly columnFilters = signal<ColumnFiltersState>([]);

  protected readonly columnsMenuOpen = signal(false);
  protected readonly filterOpenFor = signal<string | null>(null);
  protected readonly filterPos = signal({ top: 0, left: 0 });

  protected readonly table = createAngularTable<TData>(() => ({
    data: this.data(),
    columns: this.columns(),
    state: {
      columnVisibility: this.columnVisibility(),
      sorting: this.sorting(),
      columnSizing: this.columnSizing(),
      columnFilters: this.columnFilters(),
    },
    onColumnVisibilityChange: (updater) => this.columnVisibility.update((old) => resolveUpdater(updater, old)),
    onSortingChange: (updater) => this.sorting.update((old) => resolveUpdater(updater, old)),
    onColumnSizingChange: (updater) => this.columnSizing.update((old) => resolveUpdater(updater, old)),
    onColumnFiltersChange: (updater) => this.columnFilters.update((old) => resolveUpdater(updater, old)),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    defaultColumn: { minSize: 60, size: 160 },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: this.getRowId(),
  }));

  protected columnLabel(column: { id: string; columnDef: ColumnDef<TData, unknown> }): string {
    const meta = column.columnDef.meta;
    if (meta?.label) return meta.label;
    const header = column.columnDef.header;
    return typeof header === 'string' ? header : column.id;
  }

  protected onRowActivate(row: TData, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button, a, input, label')) return;
    this.rowClick.emit(row);
  }

  protected toggleColumnsMenu(): void {
    this.columnsMenuOpen.update((open) => !open);
  }

  protected closeColumnsMenu(): void {
    this.columnsMenuOpen.set(false);
  }

  protected toggleFilter(columnId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.filterOpenFor() === columnId) {
      this.filterOpenFor.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.filterPos.set({ top: rect.bottom + 4, left: rect.left });
    this.filterOpenFor.set(columnId);
  }

  protected closeFilter(): void {
    this.filterOpenFor.set(null);
  }

  protected onResizeStart(event: PointerEvent, columnId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const column = this.table.getColumn(columnId);
    if (!column) return;

    const startX = event.clientX;
    const startSize = column.getSize();
    const minSize = column.columnDef.minSize ?? 60;

    const onMove = (moveEvent: PointerEvent) => {
      const nextSize = Math.max(minSize, startSize + (moveEvent.clientX - startX));
      this.columnSizing.update((sizing) => ({ ...sizing, [columnId]: nextSize }));
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }
}
