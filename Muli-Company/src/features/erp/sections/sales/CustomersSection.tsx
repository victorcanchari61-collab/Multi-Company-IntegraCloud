import { useCustomers } from '../../queries/useSales'
import { DataTable } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/status-badge'
import { createColumnHelper } from '@tanstack/react-table'
import type { CustomerDto } from '../../services/sales.service'

const col = createColumnHelper<CustomerDto>()
const columns = [
  col.accessor('code', { header: 'Código', meta: { label: 'Código' } }),
  col.accessor('businessName', { header: 'Razón social', meta: { label: 'Razón social' } }),
  col.accessor('tradeName', { header: 'Nombre comercial', meta: { label: 'Nombre comercial' } }),
  col.accessor('taxId', { header: 'RUC', meta: { label: 'RUC' } }),
  col.accessor('phone', { header: 'Teléfono', meta: { label: 'Teléfono' } }),
  col.accessor('email', { header: 'Email', meta: { label: 'Email' } }),
  col.accessor('isActive', {
    header: 'Estado', meta: { label: 'Estado' },
    cell: ({ getValue }) => <StatusBadge isActive={getValue()} />,
  }),
]

export function CustomersSection() {
  const { data, isLoading } = useCustomers()
  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.businessName}
        emptyMessage="No hay clientes registrados."
      />
    </div>
  )
}
