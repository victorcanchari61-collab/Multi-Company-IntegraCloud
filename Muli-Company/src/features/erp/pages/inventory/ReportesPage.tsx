import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { ReportsSection } from '../../sections/inventory/ReportsSection'

export default function ReportesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Reportes</h1>
      </div>
      <ReportsSection />
    </div>
  )
}
