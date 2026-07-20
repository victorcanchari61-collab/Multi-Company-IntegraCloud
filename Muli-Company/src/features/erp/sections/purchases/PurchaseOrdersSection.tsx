import { useState, useMemo } from 'react'
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrder, useUpdatePurchaseOrderStatus, useReceivePurchaseOrder, useCreateSupplierEvaluation, useSuppliers } from '../../queries/usePurchases'
import { DataTable } from '@/components/data-table/DataTable'
import { StatCards } from '@/components/stats/StatCards'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Eye, Plus, ShoppingCart, CheckCircle2, CircleSlash2, Ban, Download } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { PurchaseOrderFormDialog } from '../../components/purchases/PurchaseOrderFormDialog'
import { PurchaseOrderDetailDialog } from '../../components/purchases/PurchaseOrderDetailDialog'
import { ReceiveOrderDialog } from '../../components/purchases/ReceiveOrderDialog'
import { SupplierEvaluationFormDialog } from '../../components/purchases/SupplierEvaluationFormDialog'
import { downloadBlob } from '@/lib/api'
import type { PurchaseOrderDto } from '../../services/purchases.service'

const statusColors: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-800',
  Issued: 'bg-blue-100 text-blue-800',
  Partial: 'bg-orange-100 text-orange-800',
  Received: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
}

const col = createColumnHelper<PurchaseOrderDto>()
const baseColumns = [
  col.accessor('orderNumber', { header: 'N° OC', meta: { label: 'N° OC' } }),
  col.accessor('supplierName', { header: 'Proveedor', meta: { label: 'Proveedor' } }),
  col.accessor('issueDate', {
    header: 'Emisión', meta: { label: 'Emisión' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  col.accessor('expectedDate', {
    header: 'Esperada', meta: { label: 'Esperada' },
    cell: ({ getValue }) => getValue() ? new Date(getValue()!).toLocaleDateString() : '-',
  }),
  col.display({
    id: 'status', header: 'Estado', meta: { label: 'Estado' },
    cell: ({ row }) => (
      <Badge className={statusColors[row.original.status] ?? ''}>
        {row.original.status === 'Draft' ? 'Borrador' :
         row.original.status === 'Issued' ? 'Emitida' :
         row.original.status === 'Partial' ? 'Parcial' :
         row.original.status === 'Received' ? 'Recibida' :
         row.original.status === 'Closed' ? 'Cerrada' : 'Anulada'}
      </Badge>
    ),
  }),
  col.accessor('total', {
    header: 'Total', meta: { label: 'Total' },
    cell: ({ getValue }) => `S/ ${getValue().toFixed(2)}`,
  }),
]

export function PurchaseOrdersSection() {
  const { data, isLoading } = usePurchaseOrders()
  const createOrder = useCreatePurchaseOrder()
  const updateOrder = useUpdatePurchaseOrder()
  const updateStatus = useUpdatePurchaseOrderStatus()
  const receiveOrder = useReceivePurchaseOrder()
  const createEvaluation = useCreateSupplierEvaluation()
  useSuppliers()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PurchaseOrderDto | null>(null)
  const [detailTarget, setDetailTarget] = useState<PurchaseOrderDto | null>(null)
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrderDto | null>(null)
  const [closeEvalTarget, setCloseEvalTarget] = useState<PurchaseOrderDto | null>(null)

  const stats = useMemo(() => {
    const list = data ?? []
    return {
      total: list.length,
      issued: list.filter((o) => o.status === 'Issued').length,
      partial: list.filter((o) => o.status === 'Partial').length,
      received: list.filter((o) => o.status === 'Received').length,
      closed: list.filter((o) => o.status === 'Closed').length,
      cancelled: list.filter((o) => o.status === 'Cancelled').length,
    }
  }, [data])

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: 'Total', value: stats.total, icon: ShoppingCart },
          { label: 'Emitidas', value: stats.issued, tone: 'primary', icon: CheckCircle2 },
          { label: 'Parciales', value: stats.partial, tone: 'warning', icon: Ban },
          { label: 'Recibidas', value: stats.received, tone: 'success', icon: Ban },
          { label: 'Cerradas', value: stats.closed, tone: 'muted', icon: CheckCircle2 },
          { label: 'Anuladas', value: stats.cancelled, tone: 'muted', icon: CircleSlash2 },
        ]}
      />

      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Nueva orden
        </Button>
      </div>

      <DataTable
        columns={[
          ...baseColumns,
          col.accessor('id', {
            id: 'actions',
            header: 'Acciones',
            enableHiding: false,
            enableSorting: false,
            meta: { label: 'Acciones' },
            cell: ({ row }) => {
              const o = row.original
              return (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="Descargar PDF" onClick={() => downloadBlob(`/erp/purchase-orders/${o.id}/pdf`)}>
                    <Download className="text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => setDetailTarget(o)}>
                    <Eye className="text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => setEditTarget(o)}>
                    <Pencil className="text-amber-500" />
                  </Button>
                  {o.status === 'Draft' && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: o.id, status: 'issued' })}>
                      Emitir
                    </Button>
                  )}
                  {(o.status === 'Issued' || o.status === 'Partial') && (
                    <Button variant="outline" size="sm" onClick={() => setReceiveTarget(o)}>
                      Recibir
                    </Button>
                  )}
                  {o.status === 'Received' && (
                    <Button variant="outline" size="sm" onClick={() => setCloseEvalTarget(o)}>
                      Cerrar
                    </Button>
                  )}
                  {(o.status === 'Draft' || o.status === 'Issued') && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: o.id, status: 'cancelled' })}>
                      Anular
                    </Button>
                  )}
                </div>
              )
            },
          }),
        ]}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => `${r.orderNumber} - ${r.supplierName}`}
        emptyMessage="No hay órdenes de compra."
      />

      <PurchaseOrderFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={async (data) => {
          await createOrder.mutateAsync(data)
        }}
      />

      <PurchaseOrderFormDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialData={editTarget ?? undefined}
        onSave={async (data) => {
          if (!editTarget) return
          await updateOrder.mutateAsync({ id: editTarget.id, data })
        }}
      />

      <PurchaseOrderDetailDialog
        order={detailTarget}
        onOpenChange={() => setDetailTarget(null)}
      />

      <ReceiveOrderDialog
        order={receiveTarget}
        open={!!receiveTarget}
        onOpenChange={() => setReceiveTarget(null)}
        onSave={async (items) => {
          if (!receiveTarget) return
          await receiveOrder.mutateAsync({ id: receiveTarget.id, items })
          setReceiveTarget(null)
        }}
      />

      <SupplierEvaluationFormDialog
        open={!!closeEvalTarget}
        onOpenChange={(open) => { if (!open) setCloseEvalTarget(null) }}
        onSave={async (data) => {
          await createEvaluation.mutateAsync({ ...data, orderId: closeEvalTarget?.id ?? null })
          if (closeEvalTarget) {
            await updateStatus.mutateAsync({ id: closeEvalTarget.id, status: 'closed' })
          }
          setCloseEvalTarget(null)
        }}
        defaultSupplierId={closeEvalTarget?.supplierId}
      />
    </div>
  )
}
