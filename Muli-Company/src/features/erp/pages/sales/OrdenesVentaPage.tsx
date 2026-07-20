import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { SalesOrdersSection } from '../../sections/sales/SalesOrdersSection'

export default function OrdenesVentaPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_VENTAS} className="text-sm text-muted-foreground hover:underline">&larr; Ventas</Link>
        <h1 className="text-2xl font-semibold">Órdenes de venta</h1>
      </div>
      <SalesOrdersSection />
    </div>
  )
}
