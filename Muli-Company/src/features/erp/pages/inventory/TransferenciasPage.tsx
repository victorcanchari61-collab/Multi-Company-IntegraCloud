import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { TransfersSection } from '../../sections/inventory/TransfersSection'

export default function TransferenciasPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Transferencias</h1>
      </div>
      <TransfersSection />
    </div>
  )
}
