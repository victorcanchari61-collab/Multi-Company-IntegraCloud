import { createContext, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'

export type ElementState = 'visible' | 'auth_required' | 'hidden'

interface ConfigModeContextType {
  enabled: boolean
  restriccionesActivas: Set<string>
  autorizacionesActivas: Set<string>
  onTogglePermiso: (componentId: string, label: string) => void
  isRestricted: (componentId: string) => boolean
  requiereAutorizacion: (componentId: string) => boolean
}

const ConfigModeContext = createContext<ConfigModeContextType | null>(null)

interface Props {
  enabled: boolean
  restriccionesActivas: string[]
  autorizacionesActivas: string[]
  onTogglePermiso: (componentId: string, label: string) => void
  children: ReactNode
}

export function ConfigModeProvider({
  enabled,
  restriccionesActivas = [],
  autorizacionesActivas = [],
  onTogglePermiso,
  children,
}: Props) {
  const restriccionesSet = new Set(restriccionesActivas)
  const autorizacionesSet = new Set(autorizacionesActivas)

  const isRestricted = useCallback(
    (componentId: string) => restriccionesSet.has(componentId),
    [restriccionesActivas],
  )

  const requiereAutorizacion = useCallback(
    (componentId: string) => !restriccionesSet.has(componentId) && autorizacionesSet.has(componentId),
    [restriccionesActivas, autorizacionesActivas],
  )

  if (!enabled) return <>{children}</>

  return (
    <ConfigModeContext.Provider
      value={{
        enabled,
        restriccionesActivas: restriccionesSet,
        autorizacionesActivas: autorizacionesSet,
        onTogglePermiso,
        isRestricted,
        requiereAutorizacion,
      }}
    >
      {children}
    </ConfigModeContext.Provider>
  )
}

export function useConfigMode() {
  const ctx = useContext(ConfigModeContext)
  if (!ctx) throw new Error('useConfigMode must be used within ConfigModeProvider')
  return ctx
}
