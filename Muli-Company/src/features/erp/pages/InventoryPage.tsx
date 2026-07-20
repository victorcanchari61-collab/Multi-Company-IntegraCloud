import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgePercent,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Coins,
  DollarSign,
  FileBarChart,
  History,
  MapPin,
  Package,
  Scale,
  ShieldCheck,
  Truck,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StatCards } from '@/components/stats/StatCards'
import {
  useStockLowReorder,
  useStockMovements,
  useStockValuation,
  useWarehouses,
} from '../queries/useInventory'

interface HubItem {
  label: string
  description: string
  route: string
  icon: LucideIcon
}

const HUBS: HubItem[] = [
  { label: 'Almacenes', description: 'Gestionar almacenes y sucursales', route: ROUTES.ERP_INVENTORY_ALMACENES, icon: Warehouse },
  { label: 'Stock actual', description: 'Consultar stock por almacén', route: ROUTES.ERP_INVENTORY_STOCK, icon: Package },
  { label: 'Movimientos de stock', description: 'Historial de movimientos de stock', route: ROUTES.ERP_INVENTORY_MOVIMIENTOS, icon: ArrowRightLeft },
  { label: 'Kárdex contable', description: 'Entradas, salidas y saldo acumulado por producto', route: ROUTES.ERP_INVENTORY_KARDEX, icon: BookOpen },
  { label: 'Costo promedio ponderado', description: 'Costo unitario promedio calculado automáticamente', route: ROUTES.ERP_INVENTORY_COSTO_PROMEDIO, icon: BadgePercent },
  { label: 'Valorización de stock', description: 'Valor total del inventario por producto', route: ROUTES.ERP_INVENTORY_VALORIZACION, icon: DollarSign },
  { label: 'Transferencias entre almacenes', description: 'Transferencias entre almacenes', route: ROUTES.ERP_INVENTORY_TRANSFERENCIAS, icon: Truck },
  { label: 'Reservas de stock', description: 'Reservar y liberar stock', route: ROUTES.ERP_INVENTORY_RESERVAS, icon: ShieldCheck },
  { label: 'Ubicaciones', description: 'Ubicaciones (racks, estantes) por almacén', route: ROUTES.ERP_INVENTORY_UBICACIONES, icon: MapPin },
  { label: 'Lotes y series', description: 'Control de lotes y números de serie', route: ROUTES.ERP_INVENTORY_LOTES_SERIES, icon: History },
  { label: 'Conteos físicos', description: 'Conteos cíclicos y físicos de inventario', route: ROUTES.ERP_INVENTORY_CONTEOS, icon: ClipboardCheck },
  { label: 'Ajustes de inventario', description: 'Ajustes positivos y negativos de stock', route: ROUTES.ERP_INVENTORY_AJUSTES, icon: Scale },
  { label: 'Niveles de reposición', description: 'Stock mínimo y máximo por producto', route: ROUTES.ERP_INVENTORY_REPOSICION, icon: FileBarChart },
  { label: 'Dashboard y reportes', description: 'Valorización, stock bajo y KPIs', route: ROUTES.ERP_INVENTORY_REPORTES, icon: BarChart3 },
]

export default function InventoryPage() {
  const { data: warehouses } = useWarehouses()
  const { data: valuation } = useStockValuation(undefined)
  const { data: lowStock } = useStockLowReorder()
  const { data: movements } = useStockMovements()

  const totalValue = (valuation ?? []).reduce((sum, v) => sum + v.totalValue, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Módulo de inventario</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona almacenes, stock, movimientos, transferencias, ubicaciones, lotes, reservas, conteos físicos y reportes.
        </p>
      </div>

      <StatCards
        items={[
          { label: 'Almacenes', value: warehouses?.length ?? 0, icon: Warehouse, tone: 'primary' },
          {
            label: 'Valor de inventario',
            value: `S/ ${totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Coins,
            tone: 'success',
          },
          { label: 'Productos bajo mínimo', value: lowStock?.length ?? 0, icon: AlertTriangle, tone: 'warning' },
          { label: 'Movimientos', value: movements?.length ?? 0, icon: ArrowRightLeft, tone: 'muted' },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HUBS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.route}
              to={item.route}
              className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-black/5 transition-all hover:bg-blue-50/40 hover:shadow-md hover:ring-blue-200"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
