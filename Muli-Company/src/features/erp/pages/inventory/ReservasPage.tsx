import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { ReservationsSection } from '../../sections/inventory/ReservationsSection'

export default function ReservasPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link to={ROUTES.ERP_INVENTORY} className="text-sm text-muted-foreground hover:underline">&larr; Inventario</Link>
        <h1 className="text-2xl font-semibold">Reservas de stock</h1>
        <p className="text-sm text-muted-foreground">
          Reservar y liberar stock para pedidos, producción u otros fines.
        </p>
      </div>
      <ReservationsSection />
    </div>
  )
}
