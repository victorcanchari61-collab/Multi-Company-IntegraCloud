import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { SalesPriceListsSection } from '../../sections/sales/SalesPriceListsSection'

export default function ListasPreciosPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_VENTAS} className="text-sm text-muted-foreground hover:underline">&larr; Ventas</Link>
        <h1 className="text-2xl font-semibold">Listas de precios</h1>
      </div>
      <SalesPriceListsSection />
    </div>
  )
}
