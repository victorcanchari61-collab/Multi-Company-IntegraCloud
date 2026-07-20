import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { StockMovementsSection } from '../../sections/inventory/StockMovementsSection'

export default function AjustesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Ajustes de inventario</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes positivos y negativos de stock.
        </p>
      </div>
      <StockMovementsSection filterMovementTypes={['ADJUSTMENT_POSITIVE', 'ADJUSTMENT_NEGATIVE']} />
    </div>
  )
}
