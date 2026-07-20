import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { LocationsSection } from '../../sections/inventory/LocationsSection'

export default function UbicacionesPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Ubicaciones de almacén</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona las ubicaciones (racks, estantes, posiciones) dentro de cada almacén.
        </p>
      </div>
      <LocationsSection />
    </div>
  )
}
