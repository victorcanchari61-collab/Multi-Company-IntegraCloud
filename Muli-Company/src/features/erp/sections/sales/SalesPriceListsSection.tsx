import { useSalesPriceLists } from '../../queries/useSales'
import { DataTable } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/status-badge'
import { createColumnHelper } from '@tanstack/react-table'
import type { SalesPriceListDto } from '../../services/sales.service'

const col = createColumnHelper<SalesPriceListDto>()
const columns = [
  col.accessor('code', { header: 'Código', meta: { label: 'Código' } }),
  col.accessor('name', { header: 'Nombre', meta: { label: 'Nombre' } }),
  col.accessor('currency', { header: 'Moneda', meta: { label: 'Moneda' } }),
  col.accessor('isActive', {
    header: 'Estado', meta: { label: 'Estado' },
    cell: ({ getValue }) => <StatusBadge isActive={getValue()} />,
  }),
]

export function SalesPriceListsSection() {
  const { data, isLoading } = useSalesPriceLists()
  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(r) => r.id}
        mobileTitle={(r) => r.name}
        emptyMessage="No hay listas de precios registradas."
      />
    </div>
  )
}
