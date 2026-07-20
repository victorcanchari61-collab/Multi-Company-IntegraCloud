import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ShoppingCart, Users, DollarSign, Handshake, Percent } from 'lucide-react'

const submodules = [
  { title: 'Cotizaciones', desc: 'Cotizaciones a clientes', route: ROUTES.ERP_VENTAS_COTIZACIONES, icon: FileText },
  { title: 'Órdenes de venta', desc: 'Gestión de órdenes de venta', route: ROUTES.ERP_VENTAS_ORDENES, icon: ShoppingCart },
  { title: 'Clientes', desc: 'Registro y gestión de clientes', route: ROUTES.ERP_VENTAS_CLIENTES, icon: Users },
  { title: 'Listas de precios', desc: 'Configuración de precios', route: ROUTES.ERP_VENTAS_LISTAS, icon: DollarSign },
  { title: 'Condiciones comerciales', desc: 'Plazos y condiciones de venta', route: ROUTES.ERP_VENTAS_CONDICIONES, icon: Handshake },
  { title: 'Comisiones de vendedores', desc: 'Gestión de comisiones', route: ROUTES.ERP_VENTAS_COMISIONES, icon: Percent },
]

export default function VentasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de ventas, clientes y precios.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {submodules.map((m) => (
          <Link key={m.route} to={m.route}>
            <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <m.icon className="size-4" />
                  {m.title}
                </CardTitle>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
