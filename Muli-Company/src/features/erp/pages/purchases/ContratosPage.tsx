import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { PurchaseContractsSection } from '../../sections/purchases/PurchaseContractsSection'

export default function ContratosPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_COMPRAS} className="text-sm text-muted-foreground hover:underline">&larr; Compras</Link>
        <h1 className="text-2xl font-semibold">Contratos de compra</h1>
      </div>
      <PurchaseContractsSection />
    </div>
  )
}
