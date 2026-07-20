import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { SuppliersSection } from '../../sections/purchases/SuppliersSection'

export default function ProveedoresPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_COMPRAS} className="text-sm text-muted-foreground hover:underline">&larr; Compras</Link>
        <h1 className="text-2xl font-semibold">Proveedores</h1>
      </div>
      <SuppliersSection />
    </div>
  )
}
