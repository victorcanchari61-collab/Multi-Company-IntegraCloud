import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  stats: { total: number; active: number; inactive: number }
}

const ITEMS = [
  { key: 'total', label: 'Total', color: 'text-foreground' },
  { key: 'active', label: 'Activos', color: 'text-success' },
  { key: 'inactive', label: 'Inactivos', color: 'text-muted-foreground' },
] as const

/** DUMB · cards informativos. Solo pinta los números que recibe por props. */
export function CatalogStatsCard({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ITEMS.map((it) => (
        <Card key={it.key}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{it.label}</p>
            <p className={cn('text-2xl font-semibold', it.color)}>{stats[it.key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
