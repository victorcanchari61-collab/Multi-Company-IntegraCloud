import { useCommercialTerms } from '../../queries/useSales'
import { DataTable } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/status-badge'
import { createColumnHelper } from '@tanstack/react-table'
import type { CommercialTermDto } from '../../services/sales.service'

const col = createColumnHelper<CommercialTermDto>()
const columns = [
  col.accessor('code', { header: 'Código', meta: { label: 'Código' } }),
  col.accessor('name', { header: 'Nombre', meta: { label: 'Nombre' } }),
  col.accessor('description', { header: 'Descripción', meta: { label: 'Descripción' } }),
  col.accessor('paymentDays', { header: 'Días', meta: { label: 'Días' } }),
  col.accessor('isActive', {
    header: 'Estado', meta: { label: 'Estado' },
    cell: ({ getValue }) => <StatusBadge isActive={getValue()} />,
  }),
]

export function CommercialTermsSection() {
  const { data, isLoading } = useCommercialTerms()
  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay condiciones comerciales registradas."
      />
    </div>
  )
}
