import { CheckCircle2, CircleSlash2, LayoutGrid } from 'lucide-react'
import { StatCards } from '@/components/stats/StatCards'

interface Props {
  stats: { total: number; active: number; inactive: number }
}

/** Cards informativos del catálogo (Total / Activos / Inactivos) sobre el genérico StatCards. */
export function CatalogStatsCard({ stats }: Props) {
  return (
    <StatCards
      items={[
        { label: 'Total', value: stats.total, icon: LayoutGrid },
        { label: 'Activos', value: stats.active, tone: 'success', icon: CheckCircle2 },
        { label: 'Inactivos', value: stats.inactive, tone: 'muted', icon: CircleSlash2 },
      ]}
    />
  )
}
