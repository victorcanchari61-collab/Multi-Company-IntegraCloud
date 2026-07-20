import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, X, Eye, EyeOff, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ConfigModeProvider } from '../components/ConfigModeProvider'
import { ConfigurableElement } from '../components/ConfigurableElement'
import { ConfigPreviewViewport } from '../components/ConfigPreviewViewport'

type ModuleState = 'visible' | 'auth_required' | 'hidden'

const STATE_META: Record<ModuleState, { label: string; desc: string; icon: typeof Eye; color: string; bg: string }> = {
  visible: { label: 'Visible', desc: 'Todos los del rol lo ven y lo usan normalmente.', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  auth_required: { label: 'Requiere autorización', desc: 'Lo ven, pero deben solicitar autorización (a su superior) para poder usarlo.', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
  hidden: { label: 'Oculto', desc: 'No aparece para el rol. No lo ve ni lo puede solicitar.', icon: EyeOff, color: 'text-red-600', bg: 'bg-red-50' },
}

const STATE_ORDER: ModuleState[] = ['visible', 'auth_required', 'hidden']

export default function ConfigViewPage() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const submoduleName = params.get('sub') ?? 'Submódulo'
  const rolName = params.get('rol') ?? 'Admin-Global'

  const [restricciones, setRestricciones] = useState<string[]>([])
  const [autorizaciones, setAutorizaciones] = useState<string[]>([])
  const [modalTarget, setModalTarget] = useState<{ id: string; label: string } | null>(null)
  const [modalState, setModalState] = useState<ModuleState>('visible')

  const handleTogglePermiso = (componentId: string, label: string) => {
    const isHidden = restricciones.includes(componentId)
    const isAuth = autorizaciones.includes(componentId)
    setModalTarget({ id: componentId, label })
    setModalState(isHidden ? 'hidden' : isAuth ? 'auth_required' : 'visible')
  }

  const handleSave = () => {
    if (!modalTarget) return
    const id = modalTarget.id

    setRestricciones((prev) =>
      modalState === 'hidden'
        ? prev.includes(id) ? prev : [...prev, id]
        : prev.filter((x) => x !== id),
    )
    setAutorizaciones((prev) =>
      modalState === 'auth_required'
        ? prev.includes(id) ? prev : [...prev, id]
        : prev.filter((x) => x !== id),
    )
    setModalTarget(null)
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-lg border bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/iam/permissions' } as never)}>
            <ArrowLeft className="mr-2 size-4" /> Volver
          </Button>
          <span className="text-sm font-semibold text-amber-800">{submoduleName}</span>
          <span className="text-xs text-amber-600">Rol: {rolName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-amber-700">
          <span className="flex items-center gap-1"><Check className="size-3 text-green-600" /> Visible</span>
          <span className="flex items-center gap-1"><Lock className="size-3 text-orange-500" /> Requiere Auth</span>
          <span className="flex items-center gap-1"><X className="size-3 text-red-500" /> Oculto</span>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <X className="mr-2 size-4" /> Salir
          </Button>
        </div>
      </div>

      {/* Main content with ConfigModeProvider */}
      <ConfigModeProvider
        enabled={true}
        restriccionesActivas={restricciones}
        autorizacionesActivas={autorizaciones}
        onTogglePermiso={handleTogglePermiso}
      >
        <ConfigPreviewViewport>
          <div className="space-y-4">
            {/* Back link */}
            <ConfigurableElement componentId={`${submoduleName}.volver`} label="Enlace volver a Compras">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <ArrowLeft className="size-4" />
                <span>Compras</span>
              </div>
            </ConfigurableElement>

            {/* Title + Columnas */}
            <div className="flex items-center justify-between">
              <ConfigurableElement componentId={`${submoduleName}.titulo`} label="Título de página">
                <h2 className="text-xl font-bold text-blue-900">Contratos de compra</h2>
              </ConfigurableElement>
              <ConfigurableElement componentId={`${submoduleName}.btn-columnas`} label="Botón Columnas">
                <Button variant="outline" size="sm">Columnas</Button>
              </ConfigurableElement>
            </div>

            {/* Table with real columns */}
            <ConfigurableElement componentId={`${submoduleName}.tabla`} label="Tabla de contratos">
              <div className="rounded-lg border">
                <div className="flex border-b bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase text-gray-500">
                  {['N° Contrato', 'Título', 'Proveedor', 'Inicio', 'Fin', 'Valor', 'Estado'].map((col) => (
                    <ConfigurableElement key={col} componentId={`${submoduleName}.col-${col}`} label={`Columna ${col}`}>
                      <span className="flex-1 cursor-pointer">{col}</span>
                    </ConfigurableElement>
                  ))}
                </div>
                <ConfigurableElement componentId={`${submoduleName}.empty-state`} label="Estado vacío">
                  <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                    No hay contratos registrados.
                  </div>
                </ConfigurableElement>
              </div>
            </ConfigurableElement>
          </div>
        </ConfigPreviewViewport>
      </ConfigModeProvider>

      {/* Decision Modal */}
      <Dialog open={!!modalTarget} onOpenChange={() => setModalTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">¿Cómo se comporta este elemento?</DialogTitle>
            <DialogDescription>
              {modalTarget?.label} · para el rol {rolName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {STATE_ORDER.map((key) => {
              const info = STATE_META[key]
              const Icon = info.icon
              const isSelected = modalState === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModalState(key)}
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                    isSelected
                      ? `${info.bg} ${key === 'visible' ? 'border-emerald-400' : key === 'auth_required' ? 'border-amber-400' : 'border-red-400'}`
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  <span className={cn(
                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                    isSelected
                      ? `${key === 'visible' ? 'bg-emerald-600' : key === 'auth_required' ? 'bg-amber-600' : 'bg-red-600'} border-transparent`
                      : 'border-gray-300',
                  )}>
                    {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('size-4', info.color)} />
                      <span className={cn('text-sm font-semibold', info.color)}>{info.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{info.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {modalState === 'auth_required' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">¿Quién aprueba?</p>
              <div className="flex items-center gap-3 rounded-lg border border-amber-400 bg-white p-3">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-amber-600 bg-amber-600">
                  <span className="size-1.5 rounded-full bg-white" />
                </span>
                <span className="text-sm font-medium">Sube al rol superior en la jerarquía</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalTarget(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
