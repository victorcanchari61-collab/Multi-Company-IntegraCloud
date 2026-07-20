import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { KardexSection } from '../../sections/inventory/KardexSection'

export default function KardexPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">
          &larr; Inventario
        </Link>
        <h1 className="text-2xl font-semibold">Kárdex contable</h1>
        <p className="text-sm text-muted-foreground">
          Movimientos cronológicos de un producto con entradas, salidas y saldo acumulado.
        </p>
      </div>
      <KardexSection />
    </div>
  )
}
