import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ENTITY_STATUS } from '@/lib/constants'

export function StatusBadge({ status }: { status: number }) {
  const active = status === ENTITY_STATUS.ACTIVE
  return (
    <Badge
      className={cn(
        'border-transparent',
        active
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground',
      )}
    >
      {active ? 'Activo' : 'Anulado'}
    </Badge>
  )
}
