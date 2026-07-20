import type { ComponentType } from 'react'
import { useParams } from '@tanstack/react-router'
import { Construction } from 'lucide-react'
import { useMenu } from '@/features/auth/queries/useMenu'
import { CurrentStockSection } from '../sections/inventory/CurrentStockSection'
import { LocationsSection } from '../sections/inventory/LocationsSection'
import { LotsAndSerialsSection } from '../sections/inventory/LotsAndSerialsSection'
import { PhysicalCountsSection } from '../sections/inventory/PhysicalCountsSection'
import { StockMovementsSection } from '../sections/inventory/StockMovementsSection'

// Submódulos WMS que ya tienen pantalla real (reusan secciones de inventario).
const REAL: Record<string, ComponentType> = {
  'almacenamiento/ubicaciones': LocationsSection,
  'almacenamiento/lotes-series': LotsAndSerialsSection,
  // Inventario físico (WMS) — los 4 submódulos funcionales.
  'inventario-fisico/stock-ubicacion': CurrentStockSection,
  'inventario-fisico/trazabilidad': StockMovementsSection,
  'inventario-fisico/conteos-fisicos': PhysicalCountsSection,
  'inventario-fisico/conteos-ciclicos': PhysicalCountsSection,
}

/** Renderiza cualquier submódulo del WMS: la pantalla real si existe, o un placeholder. */
export default function WmsViewPage() {
  const { moduleCode, viewCode } = useParams({ strict: false }) as {
    moduleCode?: string
    viewCode?: string
  }
  const { data: sections = [] } = useMenu()
  const route = `/wms/${moduleCode}/${viewCode}`
  const key = `${moduleCode}/${viewCode}`

  // Nombre exacto (del doc) tomado del menú del backend.
  let title = viewCode ?? 'WMS'
  for (const s of sections)
    for (const m of s.modules)
      for (const sub of m.submodules) if (sub.route === route) title = sub.label

  const Section = REAL[key]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {Section ? (
        <Section />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-card p-12 text-center shadow-sm ring-1 ring-black/5">
          <Construction className="mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">Módulo en construcción.</p>
        </div>
      )}
    </div>
  )
}
