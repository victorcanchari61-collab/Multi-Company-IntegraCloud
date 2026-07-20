import { useState } from 'react'
import { Eye, EyeOff, Lock, ChevronRight, Plus, Pencil, Trash2, FileDown, FileUp, FileSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type ElementState = 'visible' | 'auth_required' | 'hidden'

const STATE_META: Record<ElementState, { label: string; desc: string; icon: typeof Eye; color: string; bg: string; dot: string }> = {
  visible: { label: 'Visible', desc: 'Todos los del rol lo ven y lo usan normalmente.', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  auth_required: { label: 'Requiere autorización', desc: 'Lo ven, pero deben solicitar autorización (a su superior) para poder usarlo.', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  hidden: { label: 'Oculto', desc: 'No aparece para el rol. No lo ve ni lo puede solicitar.', icon: EyeOff, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
}

const STATE_ORDER: ElementState[] = ['visible', 'auth_required', 'hidden']

const ACTIONS = [
  { id: 'crear', label: 'Crear', icon: Plus },
  { id: 'editar', label: 'Editar', icon: Pencil },
  { id: 'eliminar', label: 'Eliminar', icon: Trash2 },
  { id: 'ver-detalle', label: 'Ver detalle', icon: FileSearch },
  { id: 'exportar', label: 'Exportar', icon: FileUp },
  { id: 'importar', label: 'Importar', icon: FileDown },
]

export function ActionsPermissionModal({ open, submoduleName, onClose }: {
  open: boolean
  submoduleName: string
  onClose: () => void
}) {
  const [elementStates, setElementStates] = useState<Record<string, ElementState>>({})
  const [selectedAction, setSelectedAction] = useState<{ id: string; label: string } | null>(null)
  const [modalState, setModalState] = useState<ElementState>('visible')


  const getState = (id: string): ElementState => elementStates[id] ?? 'visible'
  const prefix = (id: string) => `${submoduleName.toLowerCase().replace(/\s+/g, '-')}.${id}`

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Permisos de acciones</DialogTitle>
            <DialogDescription>
              {submoduleName} · configura cada acción del submódulo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {ACTIONS.map((action) => {
              const id = prefix(action.id)
              const st = getState(id)
              const info = STATE_META[st]
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => { setSelectedAction({ id, label: action.label }); setModalState(st) }}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('inline-block size-2 rounded-full', info.dot)} />
                    <span className={cn('text-[11px] font-medium', info.color)}>{info.label}</span>
                    <ChevronRight className="size-4 text-gray-400" />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Visible</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> Requiere Auth</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Oculto</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission sub-modal for each action */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Permiso del elemento</DialogTitle>
            <DialogDescription>
              {selectedAction?.label} · configura cómo se comporta este elemento
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
            <Button variant="outline" onClick={() => setSelectedAction(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (selectedAction) setElementStates((prev) => ({ ...prev, [selectedAction.id]: modalState }))
              setSelectedAction(null)
            }}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
