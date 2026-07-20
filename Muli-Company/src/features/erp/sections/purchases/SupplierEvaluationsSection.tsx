import { useState, useMemo } from 'react'
import { useSupplierEvaluations, useCreateSupplierEvaluation, useUpdateSupplierEvaluation, useDeleteSupplierEvaluation } from '../../queries/usePurchases'
import { DataTable } from '@/components/data-table/DataTable'
import { StatCards } from '@/components/stats/StatCards'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Trash2, Plus, Star, CheckCircle2, CircleSlash2 } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { SupplierEvaluationFormDialog } from '../../components/purchases/SupplierEvaluationFormDialog'
import { SupplierEvaluationDetailDialog } from '../../components/purchases/SupplierEvaluationDetailDialog'
import type { SupplierEvaluationDto } from '../../services/purchases.service'

const col = createColumnHelper<SupplierEvaluationDto>()
const baseColumns = [
  col.accessor('supplierName', { header: 'Proveedor', meta: { label: 'Proveedor' } }),
  col.accessor('evaluationDate', {
    header: 'Fecha', meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  col.accessor('score', {
    header: 'Puntaje', meta: { label: 'Puntaje' },
    cell: ({ getValue }) => (
      <span className={`font-medium ${getValue() >= 4 ? 'text-success' : getValue() >= 3 ? 'text-yellow-600' : 'text-destructive'}`}>
        {getValue()}/5
      </span>
    ),
  }),
  col.accessor('evaluatedBy', { header: 'Evaluador', meta: { label: 'Evaluador' } }),
  col.accessor('priceRating', {
    header: 'Precio', meta: { label: 'Precio' },
    cell: ({ getValue }) => getValue() ?? '-',
  }),
  col.accessor('qualityRating', {
    header: 'Calidad', meta: { label: 'Calidad' },
    cell: ({ getValue }) => getValue() ?? '-',
  }),
  col.accessor('deliveryRating', {
    header: 'Entrega', meta: { label: 'Entrega' },
    cell: ({ getValue }) => getValue() ?? '-',
  }),
]

export function SupplierEvaluationsSection() {
  const { data, isLoading } = useSupplierEvaluations()
  const createEvaluation = useCreateSupplierEvaluation()
  const updateEvaluation = useUpdateSupplierEvaluation()
  const deleteEvaluation = useDeleteSupplierEvaluation()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SupplierEvaluationDto | null>(null)
  const [detailTarget, setDetailTarget] = useState<SupplierEvaluationDto | null>(null)

  const stats = useMemo(() => {
    const list = data ?? []
    return {
      total: list.length,
      good: list.filter((e) => e.score >= 4).length,
      regular: list.filter((e) => e.score >= 3 && e.score < 4).length,
      bad: list.filter((e) => e.score < 3).length,
    }
  }, [data])

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: 'Total', value: stats.total, icon: Star },
          { label: 'Buenas (≥4)', value: stats.good, tone: 'success', icon: CheckCircle2 },
          { label: 'Regulares (3-3.9)', value: stats.regular, tone: 'warning', icon: CircleSlash2 },
          { label: 'Bajas (<3)', value: stats.bad, tone: 'destructive', icon: CircleSlash2 },
        ]}
      />

      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Nueva evaluación
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
              const e = row.original
              return (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => setDetailTarget(e)}>
                    <Eye className="text-blue-500" />
                    <span className="sr-only">Ver detalle</span>
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => setEditTarget(e)}>
                    <Pencil className="text-amber-500" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Eliminar"
                    onClick={() => {
                      if (confirm('¿Eliminar esta evaluación?')) deleteEvaluation.mutate(e.id)
                    }}
                  >
                    <Trash2 className="text-destructive" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              )
            },
          }),
        ]}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => `${r.supplierName} - ${r.score}/5`}
        emptyMessage="No hay evaluaciones registradas."
      />

      <SupplierEvaluationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={async (data) => {
          await createEvaluation.mutateAsync(data)
        }}
      />

      <SupplierEvaluationFormDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialData={editTarget ?? undefined}
        onSave={async (data) => {
          if (!editTarget) return
          await updateEvaluation.mutateAsync({ id: editTarget.id, data })
        }}
      />

      <SupplierEvaluationDetailDialog
        evaluation={detailTarget}
        onOpenChange={() => setDetailTarget(null)}
      />
    </div>
  )
}
