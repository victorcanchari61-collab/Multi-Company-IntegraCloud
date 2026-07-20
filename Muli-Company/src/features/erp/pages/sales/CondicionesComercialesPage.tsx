import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { CommercialTermsSection } from '../../sections/sales/CommercialTermsSection'

export default function CondicionesComercialesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_VENTAS} className="text-sm text-muted-foreground hover:underline">&larr; Ventas</Link>
        <h1 className="text-2xl font-semibold">Condiciones comerciales</h1>
      </div>
      <CommercialTermsSection />
    </div>
  )
}
