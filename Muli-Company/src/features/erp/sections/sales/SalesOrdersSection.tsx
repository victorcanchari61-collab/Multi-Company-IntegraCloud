import { useSalesOrders } from '../../queries/useSales'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import type { SalesOrderDto } from '../../services/sales.service'

const col = createColumnHelper<SalesOrderDto>()
const columns = [
  col.accessor('orderNumber', { header: 'Nro.', meta: { label: 'Nro.' } }),
  col.accessor('customerName', { header: 'Cliente', meta: { label: 'Cliente' } }),
  col.accessor('issueDate', {
    header: 'Fecha', meta: { label: 'Fecha' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  col.accessor('total', {
    header: 'Total', meta: { label: 'Total' },
    cell: ({ getValue }) => `S/ ${getValue().toFixed(2)}`,
  }),
  col.accessor('status', { header: 'Estado', meta: { label: 'Estado' } }),
]

export function SalesOrdersSection() {
  const { data, isLoading } = useSalesOrders()

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.orderNumber}
        emptyMessage="No hay órdenes de venta registradas."
      />
    </div>
  )
}
