import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { SupplierEvaluationsSection } from '../../sections/purchases/SupplierEvaluationsSection'

export default function EvaluacionPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_COMPRAS} className="text-sm text-muted-foreground hover:underline">&larr; Compras</Link>
        <h1 className="text-2xl font-semibold">Evaluación de proveedores</h1>
      </div>
      <SupplierEvaluationsSection />
    </div>
  )
}
