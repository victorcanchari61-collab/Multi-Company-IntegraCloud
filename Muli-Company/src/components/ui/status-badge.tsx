import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  isActive: boolean
  activeLabel?: string
  inactiveLabel?: string
  mutedInactive?: boolean
}

export function StatusBadge({
  isActive,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
  mutedInactive = false,
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-transparent',
        isActive
          ? 'bg-success text-success-foreground'
          : mutedInactive
            ? 'bg-muted text-muted-foreground'
            : 'bg-destructive text-destructive-foreground',
      )}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  )
}
