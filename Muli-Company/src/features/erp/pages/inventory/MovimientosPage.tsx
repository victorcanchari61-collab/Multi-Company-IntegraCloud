import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { StockMovementsSection } from '../../sections/inventory/StockMovementsSection'

export default function MovimientosPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Movimientos de stock</h1>
      </div>
      <StockMovementsSection />
    </div>
  )
}
