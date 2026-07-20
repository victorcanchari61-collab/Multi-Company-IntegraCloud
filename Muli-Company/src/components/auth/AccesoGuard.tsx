import { usePermission } from '@/features/auth/hooks/usePermission'
import { useAccesoVista } from '@/features/auth/hooks/usePermissions'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface AccesoGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
  /** Módulo para autorización (ej: "erp.purchase_orders") */
  module?: string
  /** Acción para autorización (ej: "approve") */
  action?: string
  /** Si true, muestra blur overlay + botón solicitar en vez de ocultar */
  blurOnBlocked?: boolean
}

export function AccesoGuard({
  permission,
  children,
  fallback,
  module,
  action,
  blurOnBlocked = false,
}: AccesoGuardProps) {
  const hasAccess = usePermission(permission)
  const [solicitando, setSolicitando] = useState(false)
  const [solicitado, setSolicitado] = useState(false)

  // Si tiene acceso, render normal
  if (hasAccess) return <>{children}</>

  // Si no hay autorización configurada, fallback normal
  if (!module || !action) {
    return fallback ?? null
  }

  // Modo blur
  if (blurOnBlocked) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
          <div className="rounded-lg bg-white p-6 shadow-xl text-center">
            {solicitado ? (
              <>
                <p className="mb-2 text-sm font-medium text-green-700">
                  Solicitud enviada
                </p>
                <p className="text-xs text-gray-500">
                  Espera a que un administrador la apruebe.
                </p>
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-medium text-gray-900">
                  Acceso restringido
                </p>
                <p className="mb-4 text-xs text-gray-500">
                  No tienes permiso para esta sección.
                </p>
                <button
                  type="button"
                  disabled={solicitando}
                  onClick={async () => {
                    setSolicitando(true)
                    try {
                      // TODO: llamar API de autorización
                      // await solicitarAcceso(module!, action!)
                      await new Promise((r) => setTimeout(r, 500))
                      setSolicitado(true)
                    } finally {
                      setSolicitando(false)
                    }
                  }}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {solicitando ? 'Enviando...' : 'Solicitar acceso'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return fallback ?? null
}

interface AccesoGuardBloqueadoProps {
  children: ReactNode
  module: string
  action: string
}

export function AccesoGuardBloqueado({
  children,
  module,
  action,
}: AccesoGuardBloqueadoProps) {
  const { requiresAuthorization } = useAccesoVista(module, action)

  if (!requiresAuthorization) return <>{children}</>

  return (
    <AccesoGuard
      permission={`${module}.${action}`}
      module={module}
      action={action}
      blurOnBlocked
    >
      {children}
    </AccesoGuard>
  )
}
