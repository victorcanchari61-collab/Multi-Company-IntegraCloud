import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnOrderState,
  Header,
  RowData,
  SortingState,
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
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, ListFilter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    label?: string
    hideOnMobile?: boolean
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  loading?: boolean
  emptyMessage?: string
  getRowId?: (row: TData) => string
  mobileTitle?: (row: TData) => ReactNode
}

const animStyles = `
@keyframes dt-fade-in {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dt-slide-down {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 4rem; }
}
.animate-dt-fade-in {
  animation: dt-fade-in 0.2s ease-out both;
}
.animate-dt-slide-down {
  animation: dt-slide-down 0.2s ease-out both;
}
`

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
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility, columnOrder, sorting },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
  const rows = table.getRowModel().rows

  return (
    <>
      <style>{animStyles}</style>
      <div className="space-y-2">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon-xs" title="Columnas" />}
            >
              <SlidersHorizontal className="size-3.5" />
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

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border md:block">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={onDragEnd}
          >
            <div className="min-h-[250px]">
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
                          <BodyCell key={col.id}>
                            <Skeleton className="h-4 w-full" />
                          </BodyCell>
                        ))}
                      </TableRow>
                    ))
                  ) : rows.length === 0 ? (
                    <TableRow className="border-b-0">
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="h-[250px] py-0 text-center text-sm text-muted-foreground"
                      >
                        <div className="flex h-full items-center justify-center">
                          {emptyMessage}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, i) => (
                      <TableRow
                        key={row.id}
                        className="animate-dt-fade-in border-b-0 hover:bg-muted/40"
                        style={{ animationDelay: `${i * 15}ms` }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <BodyCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </BodyCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DndContext>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            rows.map((row, i) => (
              <div
                key={row.id}
                className="animate-dt-slide-down rounded-lg border bg-card p-3 shadow-sm"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                {mobileTitle && (
                  <div className="mb-1.5 text-sm font-medium">{mobileTitle(row.original)}</div>
                )}
                <dl className="space-y-1">
                  {row
                    .getVisibleCells()
                    .filter((cell) => !cell.column.columnDef.meta?.hideOnMobile)
                    .map((cell) => (
                      <div
                        key={cell.id}
                        className="flex items-center justify-between gap-3 text-xs"
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
    </>
  )
}

function BodyCell({ children, className, ...props }: React.ComponentProps<typeof TableCell>) {
  return (
    <TableCell
      className={cn('h-[32px] px-2 py-0 text-xs text-black', className)}
      {...props}
    >
      <div className="flex items-center truncate">{children}</div>
    </TableCell>
  )
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUp className="size-3 shrink-0 text-white" />
  if (sorted === 'desc') return <ArrowDown className="size-3 shrink-0 text-white" />
  return <ArrowUpDown className="size-3 shrink-0 text-white" />
}

function DraggableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!filterOpen) return
    inputRef.current?.focus()
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const sorted = header.column.getIsSorted()
  const canSort = header.column.getCanSort()
  const filterValue = header.column.getFilterValue() as string | undefined
  const hasFilter = filterValue !== undefined && filterValue !== ''

  const openFilter = () => {
    if (filterOpen) {
      setFilterOpen(false)
      return
    }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setFilterPos({ top: rect.bottom + 4, left: rect.left })
    }
    setFilterOpen(true)
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className="h-[30px] border-r border-white/20 bg-zinc-800 px-1.5 py-0 text-xs font-medium text-white last:border-r-0"
    >
      <div className="flex items-center gap-0.5">
        <div
          className="flex cursor-grab touch-none select-none items-center active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3 shrink-0 text-white" />
        </div>

        {canSort ? (
          <button
            type="button"
            onClick={header.column.getToggleSortingHandler()}
            className="flex flex-1 cursor-pointer items-center gap-1 select-none truncate"
          >
            <span className="truncate">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
            <span className="shrink-0">
              <SortIcon sorted={sorted} />
            </span>
          </button>
        ) : (
          <span className="flex flex-1 items-center gap-1 truncate">
            {flexRender(header.column.columnDef.header, header.getContext())}
          </span>
        )}

        <button
          ref={btnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            openFilter()
          }}
          className="shrink-0 rounded p-0.5 hover:bg-white/10"
        >
          <ListFilter className={cn('size-3', hasFilter ? 'text-blue-400' : 'text-white')} />
        </button>
      </div>

      {filterOpen && createPortal(
        <div
          ref={filterRef}
          style={{ position: 'fixed', top: filterPos.top, left: filterPos.left, zIndex: 9999 }}
          className="w-48 rounded-md border border-border bg-popover p-1.5 shadow-lg"
        >
          <Input
            ref={inputRef}
            value={filterValue ?? ''}
            onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
            placeholder={`Filtrar...`}
            className="h-7 text-xs"
          />
        </div>,
        document.body
      )}
    </TableHead>
  )
}
