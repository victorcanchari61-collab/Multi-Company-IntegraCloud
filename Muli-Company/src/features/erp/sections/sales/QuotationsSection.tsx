import { useQuotations } from '../../queries/useSales'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import type { QuotationDto } from '../../services/sales.service'

const col = createColumnHelper<QuotationDto>()
const columns = [
  col.accessor('quotationNumber', { header: 'Nro.', meta: { label: 'Nro.' } }),
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

export function QuotationsSection() {
  const { data, isLoading } = useQuotations()

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.quotationNumber}
        emptyMessage="No hay cotizaciones registradas."
      />
    </div>
  )
}
