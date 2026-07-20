import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { WarehousesSection } from '../../sections/inventory/WarehousesSection'

export default function AlmacenesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Almacenes</h1>
      </div>
      <WarehousesSection />
    </div>
  )
}
