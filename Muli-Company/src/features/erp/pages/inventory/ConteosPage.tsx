import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { PhysicalCountsSection } from '../../sections/inventory/PhysicalCountsSection'

export default function ConteosPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Conteos físicos</h1>
        <p className="text-sm text-muted-foreground">
          Crea y gestiona conteos físicos de inventario, registra líneas y completa el proceso.
        </p>
      </div>
      <PhysicalCountsSection />
    </div>
  )
}
