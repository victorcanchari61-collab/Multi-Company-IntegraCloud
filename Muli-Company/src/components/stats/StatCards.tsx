import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatTone = 'default' | 'primary' | 'success' | 'destructive' | 'warning' | 'muted'

const TONE: Record<StatTone, { value: string; chip: string }> = {
  default: { value: 'text-foreground', chip: 'bg-muted text-muted-foreground' },
  primary: { value: 'text-primary', chip: 'bg-primary/10 text-primary' },
  success: { value: 'text-success', chip: 'bg-success/10 text-success' },
  destructive: { value: 'text-destructive', chip: 'bg-destructive/10 text-destructive' },
  warning: { value: 'text-amber-500', chip: 'bg-amber-500/10 text-amber-500' },
  muted: { value: 'text-muted-foreground', chip: 'bg-muted text-muted-foreground' },
}

// Reduce el padding interno del Card base (usa --card-spacing) para un tile compacto.
const COMPACT = { '--card-spacing': '0.6rem' } as CSSProperties

export interface StatItem {
  /** Etiqueta (ej. "Total", "Activos"). */
  label: string
  /** Valor grande. */
  value: ReactNode
  /** Icono opcional (chip a la izquierda). */
  icon?: LucideIcon
  /** Color del valor y del chip del icono. */
  tone?: StatTone
  /** Texto auxiliar pequeño. */
  hint?: string
}

interface StatCardsProps {
  items: StatItem[]
  className?: string
}

/** DUMB · fila compacta de cards informativos (KPIs). Reutilizable en cualquier módulo. */
export function StatCards({ items, className }: StatCardsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((it) => {
        const Icon = it.icon
        const tone = TONE[it.tone ?? 'default']
        return (
          <Card key={it.label} style={COMPACT} className="min-w-[124px] flex-1 sm:max-w-[190px]">
            <CardContent className="flex items-center gap-2.5">
              {Icon && (
                <span className={cn('grid size-7 shrink-0 place-items-center rounded-md', tone.chip)}>
                  <Icon className="size-3.5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[11px] leading-none text-muted-foreground">{it.label}</p>
                <p className={cn('mt-1 text-lg font-semibold leading-none tabular-nums', tone.value)}>
                  {it.value}
                </p>
                {it.hint && (
                  <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">{it.hint}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
