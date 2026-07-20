import { useState, useMemo } from 'react'
import { usePurchaseRequests, useCreatePurchaseRequest, useUpdatePurchaseRequest, useUpdatePurchaseRequestStatus, useCreatePurchaseOrder } from '../../queries/usePurchases'
import { DataTable } from '@/components/data-table/DataTable'
import { StatCards } from '@/components/stats/StatCards'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Eye, Plus, FileText, CheckCircle2, XCircle, Ban, ShoppingCart } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { PurchaseRequestFormDialog } from '../../components/purchases/PurchaseRequestFormDialog'
import { PurchaseRequestDetailDialog } from '../../components/purchases/PurchaseRequestDetailDialog'
import { PurchaseOrderFormDialog } from '../../components/purchases/PurchaseOrderFormDialog'
import type { PurchaseRequestDto } from '../../services/purchases.service'

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Ordered: 'bg-blue-100 text-blue-800',
}

const col = createColumnHelper<PurchaseRequestDto>()
const baseColumns = [
  col.accessor('requestNumber', { header: 'N° Solicitud', meta: { label: 'N° Solicitud' } }),
  col.accessor('requesterName', { header: 'Solicitante', meta: { label: 'Solicitante' } }),
  col.accessor('department', { header: 'Departamento', meta: { label: 'Departamento' } }),
  col.accessor('supplierName', { header: 'Proveedor', meta: { label: 'Proveedor' } }),
  col.display({
    id: 'priority', header: 'Prioridad', meta: { label: 'Prioridad' },
    cell: ({ row }) => {
      const p = row.original.priority
      if (!p) return null
      const colors: Record<string, string> = { alta: 'text-red-600', media: 'text-yellow-600', baja: 'text-green-600' }
      return <span className={`capitalize font-medium ${colors[p] ?? ''}`}>{p}</span>
    },
  }),
  col.accessor('requestDate', {
    header: 'Fecha', meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  col.display({
    id: 'status', header: 'Estado', meta: { label: 'Estado' },
    cell: ({ row }) => (
      <Badge className={statusColors[row.original.status] ?? ''}>
        {row.original.status === 'Draft' ? 'Borrador' :
         row.original.status === 'Pending' ? 'Pendiente' :
         row.original.status === 'Approved' ? 'Aprobada' :
         row.original.status === 'Rejected' ? 'Rechazada' : 'Ordenada'}
      </Badge>
    ),
  }),
]

export function PurchaseRequestsSection() {
  const { data, isLoading } = usePurchaseRequests()
  const createRequest = useCreatePurchaseRequest()
  const updateRequest = useUpdatePurchaseRequest()
  const updateStatus = useUpdatePurchaseRequestStatus()
  const createOrder = useCreatePurchaseOrder()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PurchaseRequestDto | null>(null)
  const [detailTarget, setDetailTarget] = useState<PurchaseRequestDto | null>(null)
  const [ordenarTarget, setOrdenarTarget] = useState<PurchaseRequestDto | null>(null)

  const stats = useMemo(() => {
    const list = data ?? []
    return {
      total: list.length,
      pending: list.filter((r) => r.status === 'Pending' || r.status === 'Draft').length,
      approved: list.filter((r) => r.status === 'Approved').length,
      rejected: list.filter((r) => r.status === 'Rejected').length,
    }
  }, [data])

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: 'Total', value: stats.total, icon: FileText },
          { label: 'Pendientes', value: stats.pending, tone: 'warning', icon: Ban },
          { label: 'Aprobadas', value: stats.approved, tone: 'success', icon: CheckCircle2 },
          { label: 'Rechazadas', value: stats.rejected, tone: 'muted', icon: XCircle },
        ]}
      />

      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Nueva solicitud
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
              const r = row.original
              return (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => setDetailTarget(r)}>
                    <Eye className="text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => setEditTarget(r)}>
                    <Pencil className="text-amber-500" />
                  </Button>
                  {r.status === 'Draft' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: r.id, status: 'approved' })}>
                        Aprobar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: r.id, status: 'rejected' })}>
                        Rechazar
                      </Button>
                    </>
                  )}
                  {r.status === 'Approved' && (
                    <Button variant="outline" size="sm" onClick={() => setOrdenarTarget(r)}>
                      <ShoppingCart className="size-3 mr-1" /> Ordenar
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
        mobileTitle={(r) => `${r.requestNumber} - ${r.supplierName ?? r.requesterName}`}
        emptyMessage="No hay solicitudes de compra."
      />

      <PurchaseRequestFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={async (data) => {
          await createRequest.mutateAsync(data)
        }}
      />

      <PurchaseRequestFormDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialData={editTarget ?? undefined}
        onSave={async (data) => {
          if (!editTarget) return
          await updateRequest.mutateAsync({ id: editTarget.id, data })
        }}
      />

      <PurchaseRequestDetailDialog
        request={detailTarget}
        onOpenChange={() => setDetailTarget(null)}
      />

      <PurchaseOrderFormDialog
        open={!!ordenarTarget}
        onOpenChange={(open) => { if (!open) setOrdenarTarget(null) }}
        supplier={ordenarTarget && ordenarTarget.supplierId ? { id: ordenarTarget.supplierId, name: ordenarTarget.supplierName ?? '' } : undefined}
        defaultItems={ordenarTarget?.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.estimatedPrice ?? 0,
        }))}
        defaultNotes={ordenarTarget?.notes ?? undefined}
        onSave={async (data) => {
          if (!ordenarTarget) return
          await createOrder.mutateAsync(data)
          await updateStatus.mutateAsync({ id: ordenarTarget.id, status: 'ordered' })
          setOrdenarTarget(null)
        }}
      />
    </div>
  )
}
