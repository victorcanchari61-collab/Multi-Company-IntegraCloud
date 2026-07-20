import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { LotsAndSerialsSection } from '../../sections/inventory/LotsAndSerialsSection'

export default function LotesSeriesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Lotes y series</h1>
        <p className="text-sm text-muted-foreground">
          Control de lotes y números de serie por producto.
        </p>
      </div>
      <LotsAndSerialsSection />
    </div>
  )
}
