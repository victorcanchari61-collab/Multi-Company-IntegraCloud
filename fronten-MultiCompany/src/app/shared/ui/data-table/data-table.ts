import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, contentChildren, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnSizingState,
  type SortingState,
  type Updater,
  type VisibilityState,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/angular-table';
import { LucideArrowDown, LucideArrowUp, LucideArrowUpDown, LucideColumns3, LucideListFilter } from '@lucide/angular';
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
 * Tabla genérica con ordenamiento, filtro por columna, redimensionar, mostrar/ocultar y
 * reordenar columnas (motor TanStack Table; el drag & drop de columnas usa la API nativa
 * HTML5 de drag — sin @angular/cdk, que se descartó por peso de bundle).
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
    LucideColumns3,
    LucideListFilter,
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
  private readonly columnOrder = signal<ColumnOrderState>([]);

  protected readonly columnsMenuOpen = signal(false);
  protected readonly filterOpenFor = signal<string | null>(null);
  protected readonly filterPos = signal({ top: 0, left: 0 });

  // Drag & drop de columnas (API nativa HTML5, sin CDK).
  protected readonly draggingColumnId = signal<string | null>(null);
  protected readonly dropTargetId = signal<string | null>(null);

  protected readonly table = createAngularTable<TData>(() => ({
    data: this.data(),
    columns: this.columns(),
    state: {
      columnVisibility: this.columnVisibility(),
      sorting: this.sorting(),
      columnSizing: this.columnSizing(),
      columnFilters: this.columnFilters(),
      columnOrder: this.columnOrder(),
    },
    onColumnVisibilityChange: (updater) => this.columnVisibility.update((old) => resolveUpdater(updater, old)),
    onSortingChange: (updater) => this.sorting.update((old) => resolveUpdater(updater, old)),
    onColumnSizingChange: (updater) => this.columnSizing.update((old) => resolveUpdater(updater, old)),
    onColumnFiltersChange: (updater) => this.columnFilters.update((old) => resolveUpdater(updater, old)),
    onColumnOrderChange: (updater) => this.columnOrder.update((old) => resolveUpdater(updater, old)),
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

  protected onDragStart(event: DragEvent, columnId: string): void {
    this.draggingColumnId.set(columnId);
    // Firefox exige setData para iniciar el drag.
    event.dataTransfer?.setData('text/plain', columnId);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  protected onDragOver(event: DragEvent, columnId: string): void {
    if (!this.draggingColumnId()) return;
    event.preventDefault(); // sin esto el navegador no permite soltar
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (this.dropTargetId() !== columnId) this.dropTargetId.set(columnId);
  }

  protected onDrop(event: DragEvent, targetColumnId: string): void {
    event.preventDefault();
    const sourceId = this.draggingColumnId();
    this.onDragEnd();
    if (!sourceId || sourceId === targetColumnId) return;

    // columnOrder arranca vacío (orden de definición): se materializa recién al primer drop.
    const order = this.columnOrder().length
      ? [...this.columnOrder()]
      : this.table.getAllLeafColumns().map((column) => column.id);
    const from = order.indexOf(sourceId);
    const to = order.indexOf(targetColumnId);
    if (from < 0 || to < 0) return;

    order.splice(to, 0, ...order.splice(from, 1));
    this.columnOrder.set(order);
  }

  protected onDragEnd(): void {
    this.draggingColumnId.set(null);
    this.dropTargetId.set(null);
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
