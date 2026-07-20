import { useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigMode } from './ConfigModeProvider'
import type { ElementState } from './ConfigModeProvider'

interface Props {
  componentId: string
  label: string
  children: ReactNode
}

export function ConfigurableElement({ componentId, label, children }: Props) {
  const { enabled, isRestricted, requiereAutorizacion, onTogglePermiso } = useConfigMode()
  const [isHovered, setIsHovered] = useState(false)

  if (!enabled) return <>{children}</>

  const restricted = isRestricted(componentId)
  const authReq = !restricted && requiereAutorizacion(componentId)
  const estado: ElementState = restricted ? 'hidden' : authReq ? 'auth_required' : 'visible'

  const borderColor = estado === 'visible'
    ? 'border-green-400/70'
    : estado === 'auth_required'
      ? 'border-orange-400/80'
      : 'border-red-400/70'

  const badgeBg = estado === 'visible'
    ? 'bg-green-500'
    : estado === 'auth_required'
      ? 'bg-orange-500 animate-pulse'
      : 'bg-red-500'

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layer 1: Original content (blocked interaction + tint if hidden) */}
      <div className={cn(
        'pointer-events-none select-none',
        estado === 'hidden' && 'opacity-40 grayscale',
      )}>
        {children}
      </div>

      {/* Layer 2: Transparent overlay that captures clicks */}
      <div
        className="absolute inset-0 z-[9999] cursor-pointer"
        onClick={() => onTogglePermiso(componentId, label)}
        title={`Click para configurar: ${label}`}
      />

      {/* Layer 3: State border always visible */}
      <div className={cn('pointer-events-none absolute inset-0 rounded border-2', borderColor)} />

      {/* Layer 4: Badge in top-right corner */}
      <div className={cn(
        'pointer-events-none absolute -top-2 -right-2 z-[9998] flex size-5 items-center justify-center rounded-full border-2 border-white shadow-md',
        badgeBg,
      )}>
        {estado === 'visible' && <Check className="size-3 text-white" />}
        {estado === 'auth_required' && <Lock className="size-3 text-white" />}
        {estado === 'hidden' && <X className="size-3 text-white" />}
      </div>

      {/* Extra: Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-6 left-0 z-[9998] rounded bg-blue-600 px-2 py-1 text-xs text-white shadow-lg">
          {label} · {estado === 'visible' ? 'VISIBLE' : estado === 'auth_required' ? 'REQUIERE AUTORIZACIÓN' : 'OCULTO'}
        </div>
      )}
    </div>
  )
}
