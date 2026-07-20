import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrgNodeProps {
  name: string
  isHighlighted: boolean
}

export function OrgNode({ name, isHighlighted }: OrgNodeProps) {
  return (
    <div className="group relative">
      <div
        data-org-node
        className={cn(
          'relative flex min-w-[140px] flex-col items-center justify-center rounded-lg border-2 px-5 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:shadow-lg',
          isHighlighted
            ? 'border-amber-500 bg-amber-500 text-white'
            : 'border-amber-600/40 bg-white text-blue-900',
        )}
      >
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60">
          <GripVertical className="size-3.5 text-gray-400" />
        </div>
        <span className="whitespace-nowrap">{name}</span>
      </div>
    </div>
  )
}
