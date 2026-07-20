import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { SalesCommissionsSection } from '../../sections/sales/SalesCommissionsSection'

export default function ComisionesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_VENTAS} className="text-sm text-muted-foreground hover:underline">&larr; Ventas</Link>
        <h1 className="text-2xl font-semibold">Comisiones de vendedores</h1>
      </div>
      <SalesCommissionsSection />
    </div>
  )
}
