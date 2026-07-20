import { useState, useMemo } from 'react'
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useSetSupplierStatus, useSupplierEvaluations } from '../../queries/usePurchases'
import { DataTable } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/status-badge'
import { StatCards } from '@/components/stats/StatCards'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Ban, Power, Plus, Building2, CheckCircle2, CircleSlash2, History } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { SupplierFormDialog } from '../../components/purchases/SupplierFormDialog'
import { SupplierDetailDialog } from '../../components/purchases/SupplierDetailDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SupplierDto } from '../../services/purchases.service'

const col = createColumnHelper<SupplierDto>()
const baseColumns = [
  col.accessor('code', { header: 'RUC', meta: { label: 'RUC' } }),
  col.accessor('businessName', { header: 'Razón social', meta: { label: 'Razón social' } }),
  col.accessor('tradeName', { header: 'Nombre comercial', meta: { label: 'Nombre comercial' } }),
  col.accessor('phone', { header: 'Teléfono', meta: { label: 'Teléfono' } }),
  col.accessor('email', { header: 'Email', meta: { label: 'Email' } }),
  col.accessor('contactPerson', { header: 'Contacto', meta: { label: 'Contacto' } }),
  col.accessor('isActive', {
    header: 'Estado', meta: { label: 'Estado' },
    cell: ({ getValue }) => <StatusBadge isActive={getValue()} />,
  }),
]

function EvaluationHistoryDialog({ supplierId, supplierName, open, onOpenChange }: { supplierId: string; supplierName: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: evaluations } = useSupplierEvaluations(supplierId)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de evaluaciones - {supplierName}</DialogTitle>
        </DialogHeader>
        {(evaluations ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin evaluaciones registradas.</p>
        ) : (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Plazo</TableHead>
                  <TableHead className="text-right">Calidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead>Comentario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations?.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.evaluationDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{e.deliveryRating ?? '-'}/5</TableCell>
                    <TableCell className="text-right">{e.qualityRating ?? '-'}/5</TableCell>
                    <TableCell className="text-right">{e.priceRating ?? '-'}/5</TableCell>
                    <TableCell className="max-w-[160px] truncate">{e.comments || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SuppliersSection() {
  const { data, isLoading } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const setSupplierStatus = useSetSupplierStatus()
  const { data: evaluations } = useSupplierEvaluations()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SupplierDto | null>(null)
  const [detailTarget, setDetailTarget] = useState<SupplierDto | null>(null)
  const [historyTarget, setHistoryTarget] = useState<{ id: string; name: string } | null>(null)

  const supplierAvg = useMemo(() => {
    if (!evaluations) return new Map<string, number>()
    const map = new Map<string, { sum: number; count: number }>()
    for (const e of evaluations) {
      const avg = ((e.priceRating ?? 0) + (e.qualityRating ?? 0) + (e.deliveryRating ?? 0)) / 3
      const prev = map.get(e.supplierId) ?? { sum: 0, count: 0 }
      prev.sum += avg
      prev.count += 1
      map.set(e.supplierId, prev)
    }
    const result = new Map<string, number>()
    for (const [id, val] of map) {
      result.set(id, Math.round((val.sum / val.count) * 10) / 10)
    }
    return result
  }, [evaluations])

  const stats = useMemo(() => {
    const list = data ?? []
    const active = list.filter((s) => s.isActive).length
    return {
      total: list.length,
      active,
      inactive: list.length - active,
    }
  }, [data])

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: 'Total', value: stats.total, icon: Building2 },
          { label: 'Activos', value: stats.active, tone: 'success', icon: CheckCircle2 },
          { label: 'Inactivos', value: stats.inactive, tone: 'muted', icon: CircleSlash2 },
        ]}
      />

      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Nuevo proveedor
        </Button>
      </div>

      <DataTable
        columns={[
          ...baseColumns,
          col.display({
            id: 'average', header: 'Promedio', meta: { label: 'Promedio' },
            cell: ({ row }) => {
              const avg = supplierAvg.get(row.original.id)
              if (avg === undefined) return <span className="text-muted-foreground/50">—</span>
              const color = avg >= 4 ? 'text-green-600' : avg >= 3 ? 'text-yellow-600' : 'text-red-600'
              return <span className={`font-medium ${color}`}>{avg.toFixed(1)}</span>
            },
          }),
          col.accessor('id', {
            id: 'actions',
            header: 'Acciones',
            enableHiding: false,
            enableSorting: false,
            meta: { label: 'Acciones' },
            cell: ({ row }) => {
              const s = row.original
              return (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => setDetailTarget(s)}>
                    <Eye className="text-blue-500" />
                    <span className="sr-only">Ver detalle</span>
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => setEditTarget(s)}>
                    <Pencil className="text-amber-500" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Historial" onClick={() => setHistoryTarget({ id: s.id, name: s.businessName })}>
                    <History className="text-purple-500" />
                    <span className="sr-only">Historial</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={s.isActive ? 'Anular' : 'Activar'}
                    onClick={() => setSupplierStatus.mutate({ id: s.id, isActive: !s.isActive })}
                  >
                    {s.isActive ? <Ban className="text-destructive" /> : <Power className="text-success" />}
                    <span className="sr-only">{s.isActive ? 'Anular' : 'Activar'}</span>
                  </Button>
                </div>
              )
            },
          }),
        ]}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.businessName}
        emptyMessage="No hay proveedores registrados."
      />

      <SupplierFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={async (data) => {
          await createSupplier.mutateAsync(data)
        }}
      />

      <SupplierFormDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialData={editTarget ?? undefined}
        onSave={async (data) => {
          if (!editTarget) return
          await updateSupplier.mutateAsync({ id: editTarget.id, data })
        }}
      />

      <SupplierDetailDialog
        supplier={detailTarget}
        onOpenChange={() => setDetailTarget(null)}
      />

      <EvaluationHistoryDialog
        supplierId={historyTarget?.id ?? ''}
        supplierName={historyTarget?.name ?? ''}
        open={!!historyTarget}
        onOpenChange={(v) => { if (!v) setHistoryTarget(null) }}
      />
    </div>
  )
}
