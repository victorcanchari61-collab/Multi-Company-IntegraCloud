import { StatusBadge as BaseStatusBadge } from '@/components/ui/status-badge'
import { ENTITY_STATUS } from '@/lib/constants'

export function StatusBadge({ status }: { status: number }) {
  return (
    <BaseStatusBadge
      isActive={status === ENTITY_STATUS.ACTIVE}
      inactiveLabel="Anulado"
    />
  )
}
