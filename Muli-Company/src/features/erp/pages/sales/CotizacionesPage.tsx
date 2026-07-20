import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { QuotationsSection } from '../../sections/sales/QuotationsSection'

export default function CotizacionesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_VENTAS} className="text-sm text-muted-foreground hover:underline">&larr; Ventas</Link>
        <h1 className="text-2xl font-semibold">Cotizaciones</h1>
      </div>
      <QuotationsSection />
    </div>
  )
}
