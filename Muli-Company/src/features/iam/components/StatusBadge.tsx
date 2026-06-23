import { Badge } from '@/components/ui/badge'
import { ENTITY_STATUS } from '@/lib/constants'

export function StatusBadge({ status }: { status: number }) {
  const active = status === ENTITY_STATUS.ACTIVE
  return (
    <Badge variant={active ? 'default' : 'secondary'}>
      {active ? 'Activo' : 'Suspendido'}
    </Badge>
  )
}
