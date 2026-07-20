import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { CustomersSection } from '../../sections/sales/CustomersSection'

export default function ClientesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_VENTAS} className="text-sm text-muted-foreground hover:underline">&larr; Ventas</Link>
        <h1 className="text-2xl font-semibold">Clientes</h1>
      </div>
      <CustomersSection />
    </div>
  )
}
