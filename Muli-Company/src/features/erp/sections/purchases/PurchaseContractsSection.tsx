import { useState, useMemo } from 'react'
import { usePurchaseContracts, useCreatePurchaseContract, useUpdatePurchaseContract, useSetPurchaseContractStatus } from '../../queries/usePurchases'
import { DataTable } from '@/components/data-table/DataTable'
import { Badge } from '@/components/ui/badge'
import { StatCards } from '@/components/stats/StatCards'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Ban, Power, Plus, FileText, CheckCircle2, CircleSlash2 } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { ContractFormDialog } from '../../components/purchases/ContractFormDialog'
import { ContractDetailDialog } from '../../components/purchases/ContractDetailDialog'
import type { PurchaseContractDto } from '../../services/purchases.service'

const col = createColumnHelper<PurchaseContractDto>()
const baseColumns = [
  col.accessor('contractNumber', { header: 'N° Contrato', meta: { label: 'N° Contrato' } }),
  col.accessor('title', { header: 'Título', meta: { label: 'Título' } }),
  col.accessor('supplierName', { header: 'Proveedor', meta: { label: 'Proveedor' } }),
  col.accessor('startDate', {
    header: 'Inicio', meta: { label: 'Inicio' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  col.accessor('endDate', {
    header: 'Fin', meta: { label: 'Fin' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  col.accessor('value', {
    header: 'Valor', meta: { label: 'Valor' },
    cell: ({ getValue }) => { const v = getValue(); return v ? `S/ ${v.toFixed(2)}` : '-'; },
  }),
  col.display({
    id: 'status', header: 'Estado', meta: { label: 'Estado' },
    cell: ({ row }) => {
      const c = row.original
      const expired = new Date(c.endDate) < new Date()
      if (!c.isActive) return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
      if (expired) return <Badge className="bg-orange-100 text-orange-800">Expirado</Badge>
      return <Badge className="bg-green-100 text-green-800">Vigente</Badge>
    },
  }),
]

export function PurchaseContractsSection() {
  const { data, isLoading } = usePurchaseContracts()
  const createContract = useCreatePurchaseContract()
  const updateContract = useUpdatePurchaseContract()
  const setContractStatus = useSetPurchaseContractStatus()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PurchaseContractDto | null>(null)
  const [detailTarget, setDetailTarget] = useState<PurchaseContractDto | null>(null)

  const stats = useMemo(() => {
    const list = data ?? []
    const active = list.filter((c) => c.isActive).length
    const expired = list.filter((c) => c.isActive && new Date(c.endDate) < new Date()).length
    return { total: list.length, active, expired, inactive: list.length - active }
  }, [data])

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: 'Total', value: stats.total, icon: FileText },
          { label: 'Vigentes', value: stats.active - stats.expired, tone: 'success', icon: CheckCircle2 },
          { label: 'Expirados', value: stats.expired, tone: 'warning', icon: Ban },
          { label: 'Inactivos', value: stats.inactive, tone: 'muted', icon: CircleSlash2 },
        ]}
      />

      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Nuevo contrato
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
              const c = row.original
              return (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => setDetailTarget(c)}>
                    <Eye className="text-blue-500" />
                    <span className="sr-only">Ver detalle</span>
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => setEditTarget(c)}>
                    <Pencil className="text-amber-500" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={c.isActive ? 'Anular' : 'Activar'}
                    onClick={() => setContractStatus.mutate({ id: c.id, isActive: !c.isActive })}
                  >
                    {c.isActive ? <Ban className="text-destructive" /> : <Power className="text-success" />}
                    <span className="sr-only">{c.isActive ? 'Anular' : 'Activar'}</span>
                  </Button>
                </div>
              )
            },
          }),
        ]}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => `${r.contractNumber} - ${r.title}`}
        emptyMessage="No hay contratos registrados."
      />

      <ContractFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={async (data) => {
          await createContract.mutateAsync(data)
        }}
      />

      <ContractFormDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialData={editTarget ?? undefined}
        onSave={async (data) => {
          if (!editTarget) return
          await updateContract.mutateAsync({ id: editTarget.id, data })
        }}
      />

      <ContractDetailDialog
        contract={detailTarget}
        onOpenChange={() => setDetailTarget(null)}
      />
    </div>
  )
}
