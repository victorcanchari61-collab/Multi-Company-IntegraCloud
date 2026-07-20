import { useState, type ReactNode } from 'react'
import { Smartphone, Tablet, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewportSize = 'mobile' | 'tablet' | 'desktop'

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  mobile: 'w-[390px]',
  tablet: 'w-[768px]',
  desktop: 'w-full',
}

interface Props {
  children: ReactNode
  defaultSize?: ViewportSize
}

export function ConfigPreviewViewport({ children, defaultSize = 'desktop' }: Props) {
  const [viewport, setViewport] = useState<ViewportSize>(defaultSize)

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          Vista previa en vivo
        </span>
        <div className="flex items-center rounded-lg border p-0.5">
          {([
            { key: 'mobile' as const, icon: Smartphone, label: 'Móvil' },
            { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
            { key: 'desktop' as const, icon: Monitor, label: 'Escritorio' },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewport(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewport === key ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewport content */}
      <div className="flex justify-center bg-gray-100 p-4">
        <div
          className={cn(
            'overflow-auto rounded-lg border bg-white shadow-inner transition-all',
            VIEWPORT_WIDTHS[viewport],
            'h-[calc(100vh-250px)]',
          )}
        >
          <div className="h-full p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
