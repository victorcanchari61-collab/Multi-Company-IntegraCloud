import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnOrderState,
  Header,
  RowData,
  VisibilityState,
} from '@tanstack/react-table'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Etiqueta para el menú de columnas y la vista móvil. */
    label?: string
    /** Oculta esta columna en la vista de cards (móvil). */
    hideOnMobile?: boolean
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  loading?: boolean
  emptyMessage?: string
  getRowId?: (row: TData) => string
  /** Título de cada card en la vista móvil. */
  mobileTitle?: (row: TData) => ReactNode
}

const columnLabel = <TData,>(column: {
  id: string
  columnDef: ColumnDef<TData, unknown>
}): string => {
  const meta = column.columnDef.meta
  if (meta?.label) return meta.label
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay registros.',
  getRowId,
  mobileTitle,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    columns.map((c) => c.id as string),
  )

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility, columnOrder },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setColumnOrder((order) => {
      const from = order.indexOf(active.id as string)
      const to = order.indexOf(over.id as string)
      return arrayMove(order, from, to)
    })
  }

  const hideableColumns = table.getAllLeafColumns().filter((c) => c.getCanHide())

  return (
    <div className="space-y-3">
      {/* Toolbar: mostrar/ocultar columnas */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon" title="Columnas" />}
          >
            <SlidersHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(value === true)}
                  closeOnClick={false}
                >
                  {columnLabel(column)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Vista escritorio: tabla con columnas reordenables */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={onDragEnd}
        >
          <Table>
            <TableHeader className="[&_tr]:border-b-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-zinc-800 hover:bg-zinc-800">
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b-0">
                    {table.getVisibleLeafColumns().map((col) => (
                      <TableCell key={col.id} className="border-r border-border last:border-r-0">
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="border-b-0">
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b-0 hover:bg-muted/40">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-r border-border last:border-r-0"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Vista móvil: cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))
        ) : table.getRowModel().rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          table.getRowModel().rows.map((row) => (
            <div key={row.id} className="rounded-lg border bg-card p-4 shadow-sm">
              {mobileTitle && (
                <div className="mb-2 font-medium">{mobileTitle(row.original)}</div>
              )}
              <dl className="space-y-1.5">
                {row
                  .getVisibleCells()
                  .filter((cell) => !cell.column.columnDef.meta?.hideOnMobile)
                  .map((cell) => (
                    <div
                      key={cell.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{columnLabel(cell.column)}</dt>
                      <dd className="text-right">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DraggableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className="border-r border-white/20 bg-zinc-800 font-medium text-white last:border-r-0"
    >
      <div
        className="flex cursor-grab touch-none select-none items-center gap-1.5 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5 shrink-0 text-white/50" />
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  )
}
