import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { AverageCostSection } from '../../sections/inventory/AverageCostSection'

export default function CostoPromedioPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">
          &larr; Inventario
        </Link>
        <h1 className="text-2xl font-semibold">Costo promedio ponderado</h1>
        <p className="text-sm text-muted-foreground">
          Evolución del costo unitario promedio calculado automáticamente con cada entrada.
        </p>
      </div>
      <AverageCostSection />
    </div>
  )
}
