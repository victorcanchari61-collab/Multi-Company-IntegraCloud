import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ShoppingCart, Users, FileText, Star, FileSignature } from 'lucide-react'

const submodules = [
  { title: 'Órdenes de compra', desc: 'Gestión de órdenes de compra', route: ROUTES.ERP_COMPRAS_ORDENES, icon: ShoppingCart },
  { title: 'Proveedores', desc: 'Registro y gestión de proveedores', route: ROUTES.ERP_COMPRAS_PROVEEDORES, icon: Users },
  { title: 'Solicitudes de compra', desc: 'Solicitudes internas de compra', route: ROUTES.ERP_COMPRAS_SOLICITUDES, icon: FileText },
  { title: 'Evaluación de proveedores', desc: 'Evaluación de desempeño', route: ROUTES.ERP_COMPRAS_EVALUACION, icon: Star },
  { title: 'Contratos de compra', desc: 'Contratos y acuerdos', route: ROUTES.ERP_COMPRAS_CONTRATOS, icon: FileSignature },
]

export default function ComprasPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div>
        <button onClick={() => navigate({ to: ROUTES.DASHBOARD })} className="flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ChevronLeft className="size-3.5" /> ERP
        </button>
        <h1 className="text-2xl font-semibold">Compras</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de compras, proveedores y contratos.
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
