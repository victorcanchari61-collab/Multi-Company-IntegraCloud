import { useSalesCommissions } from '../../queries/useSales'
import { DataTable } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/status-badge'
import { createColumnHelper } from '@tanstack/react-table'
import type { SalesCommissionDto } from '../../services/sales.service'

const col = createColumnHelper<SalesCommissionDto>()
const columns = [
  col.accessor('code', { header: 'Código', meta: { label: 'Código' } }),
  col.accessor('name', { header: 'Nombre', meta: { label: 'Nombre' } }),
  col.accessor('salesAgentName', { header: 'Vendedor', meta: { label: 'Vendedor' } }),
  col.accessor('commissionRate', {
    header: 'Comisión %', meta: { label: 'Comisión %' },
    cell: ({ getValue }) => `${getValue()}%`,
  }),
  col.accessor('isActive', {
    header: 'Estado', meta: { label: 'Estado' },
    cell: ({ getValue }) => <StatusBadge isActive={getValue()} />,
  }),
]

export function SalesCommissionsSection() {
  const { data, isLoading } = useSalesCommissions()
  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay comisiones registradas."
      />
    </div>
  )
}
