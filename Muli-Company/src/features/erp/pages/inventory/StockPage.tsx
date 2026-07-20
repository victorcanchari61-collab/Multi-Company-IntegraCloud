import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { CurrentStockSection } from '../../sections/inventory/CurrentStockSection'

export default function StockPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Stock actual</h1>
      </div>
      <CurrentStockSection />
    </div>
  )
}
