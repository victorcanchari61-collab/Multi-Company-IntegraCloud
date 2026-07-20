import { useState } from 'react'
import { useWarehouses, usePhysicalCounts, useCreatePhysicalCount, useCompletePhysicalCount, useApprovePhysicalCount, useCancelPhysicalCount, usePhysicalCountById } from '../../queries/useInventory'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { createColumnHelper } from '@tanstack/react-table'
import { PhysicalCountFormDialog } from '../../components/inventory/PhysicalCountFormDialog'
import type { PhysicalCountDto, PhysicalCountLineDto } from '../../services/inventory.service'

const columnHelper = createColumnHelper<PhysicalCountDto>()

const columns = [
  columnHelper.accessor('warehouseName', { header: 'Almacén', meta: { label: 'Almacén' } }),
  columnHelper.accessor('status', {
    header: 'Estado',
    meta: { label: 'Estado' },
    cell: ({ getValue }) => {
      const status = getValue()
      const variant = status === 'APPROVED' ? 'success' : status === 'COMPLETED' ? 'default' : status === 'IN_PROGRESS' ? 'secondary' : 'outline'
      return <Badge variant={variant}>{status}</Badge>
    },
  }),
  columnHelper.accessor('lineCount', { header: 'Líneas', meta: { label: 'Líneas' } }),
  columnHelper.accessor('countedLines', { header: 'Contadas', meta: { label: 'Contadas' } }),
  columnHelper.accessor('notes', { header: 'Notas', meta: { label: 'Notas' } }),
  columnHelper.accessor('createdAt', {
    header: 'Creado',
    meta: { label: 'Creado' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
]

const statusBadge = (status: string) => {
  const variants: Record<string, 'success' | 'default' | 'secondary' | 'outline' | 'destructive'> = {
    APPROVED: 'success',
    COMPLETED: 'default',
    IN_PROGRESS: 'secondary',
    DRAFT: 'outline',
    CANCELLED: 'destructive',
  }
  return <Badge variant={variants[status] ?? 'outline'}>{status}</Badge>
}

export function PhysicalCountsSection() {
  const { data: warehouses } = useWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const { data: counts, isLoading } = usePhysicalCounts(selectedWarehouse || undefined)
  const createCount = useCreatePhysicalCount()
  const completeCount = useCompletePhysicalCount()
  const approveCount = useApprovePhysicalCount()
  const cancelCount = useCancelPhysicalCount()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const { data: detail } = usePhysicalCountById(detailId ?? '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Almacén:</span>
          <Select value={selectedWarehouse} onValueChange={(v) => setSelectedWarehouse(v ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos los almacenes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos los almacenes</SelectItem>
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Nuevo conteo
        </Button>
      </div>

      <DataTable
        columns={[
          ...columns,
          columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            meta: { label: 'Acciones' },
            cell: ({ row }) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailId(row.original.id)}>
                  <Eye className="size-3" /> Ver
                </Button>
                {row.original.status === 'DRAFT' && (
                  <Button variant="outline" size="sm" onClick={() => completeCount.mutate(row.original.id)}>
                    Completar
                  </Button>
                )}
                {row.original.status === 'COMPLETED' && (
                  <Button variant="outline" size="sm" onClick={() => approveCount.mutate(row.original.id)}>
                    Aprobar
                  </Button>
                )}
                {(row.original.status === 'DRAFT' || row.original.status === 'IN_PROGRESS') && (
                  <Button variant="outline" size="sm" onClick={() => cancelCount.mutate(row.original.id)}>
                    Cancelar
                  </Button>
                )}
              </div>
            ),
          }),
        ]}
        data={counts ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.warehouseName}
        emptyMessage="No hay conteos físicos."
      />

      <PhysicalCountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={async (data) => {
          await createCount.mutateAsync(data)
          setDialogOpen(false)
        }}
        saving={createCount.isPending}
      />

      {/* Detail dialog */}
      <Dialog open={!!detailId} onOpenChange={(o) => { if (!o) setDetailId(null) }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Conteo físico</DialogTitle>
            <DialogDescription>
              {detail && (
                <span>{detail.warehouseName} — {statusBadge(detail.status)}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Creado:</span> {new Date(detail.createdAt).toLocaleString()}</div>
                {detail.completedAt && <div><span className="text-muted-foreground">Completado:</span> {new Date(detail.completedAt).toLocaleString()}</div>}
                {detail.approvedAt && <div><span className="text-muted-foreground">Aprobado:</span> {new Date(detail.approvedAt).toLocaleString()}</div>}
              </div>
              <DataTable
                columns={[
                  { accessorKey: 'productName', header: 'Producto', meta: { label: 'Producto' } },
                  { accessorKey: 'expectedQuantity', header: 'Esperado', meta: { label: 'Esperado' } },
                  { accessorKey: 'countedQuantity', header: 'Contado', meta: { label: 'Contado' } },
                  {
                    accessorKey: 'difference',
                    header: 'Diferencia',
                    meta: { label: 'Diferencia' },
                    cell: ({ getValue }: { getValue: () => number }) => {
                      const v = getValue()
                      return <span className={v !== 0 ? 'text-destructive font-medium' : ''}>{v > 0 ? `+${v}` : v}</span>
                    },
                  },
                  { accessorKey: 'status', header: 'Estado', meta: { label: 'Estado' } },
                ]}
                data={detail.lines}
                getRowId={(r: PhysicalCountLineDto) => r.id}
                mobileTitle={(r: PhysicalCountLineDto) => r.productName}
                emptyMessage="Sin líneas."
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
