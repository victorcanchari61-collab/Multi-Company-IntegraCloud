import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ShieldCheck,
  Boxes,
  ShoppingCart,
  Package,
  UserCheck,
  Users,
  KeyRound,
  Folder,
  Ruler,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ChevronRight,
  Settings,
  Warehouse,
  Calculator,
  BookOpen,
  ArrowLeftRight,
  RefreshCw,
  FileText,
  ArrowUpDown,
  DollarSign,
  Truck,
  ClipboardList,
  Receipt,
  FileSearch,
  ClipboardCheck,
  Scale,
  ScanLine,
  BarChart3,
  TrendingUp,
  ListChecks,
  Tags,
  Files,
  Map,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useRoles } from '../queries/useRoles'
import { useMenu } from '@/features/auth/queries/useMenu'
import { useUsers } from '../queries/useUsers'
import { ActionsPermissionModal } from '../components/ActionsPermissionModal'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { MenuModule } from '@/features/auth/services/menu.service'

const SYSTEM_ICONS: Record<string, LucideIcon> = {
  IAM: ShieldCheck,
  ERP: Boxes,
  POS: ShoppingCart,
  WMS: Package,
  RRHH: UserCheck,
}

const MODULE_ICONS: Record<string, LucideIcon> = {
  users: Users,
  roles: ShieldCheck,
  permissions: KeyRound,
  productos: Boxes,
  inventario: Package,
  compras: ShoppingCart,
  ventas: ShoppingCart,
  units: Ruler,
}

const MODULE_COLORS: Record<string, string> = {
  users: 'text-blue-600 bg-blue-100',
  roles: 'text-purple-600 bg-purple-100',
  permissions: 'text-emerald-600 bg-emerald-100',
  productos: 'text-orange-600 bg-orange-100',
  inventario: 'text-cyan-600 bg-cyan-100',
  compras: 'text-rose-600 bg-rose-100',
  ventas: 'text-amber-600 bg-amber-100',
  units: 'text-slate-600 bg-slate-100',
}

const SUBMODULE_ICONS: Record<string, LucideIcon> = {
  // Inventario
  almacenes: Warehouse,
  stock: Package,
  movimientos: ArrowLeftRight,
  transferencias: ArrowUpDown,
  kardex: BookOpen,
  reservas: Lock,
  valorizacion: DollarSign,
  reposicion: RefreshCw,
  ajustes: Settings,
  'costo-promedio': Calculator,
  reportes: FileText,
  conteos: ClipboardCheck,
  ubicaciones: Map,
  'lotes-series': Tags,
  // Compras
  'ordenes-compra': Receipt,
  proveedores: Truck,
  solicitudes: ClipboardList,
  evaluacion: FileSearch,
  contratos: Files,
  // Ventas
  cotizaciones: FileText,
  'ordenes-venta': Receipt,
  clientes: Users,
  'listas-precios': Tags,
  'condiciones-comerciales': Scale,
  'comisiones-vendedores': TrendingUp,
  // WMS
  recepcion: ScanLine,
  ubicacion: Warehouse,
  picking: ListChecks,
  despacho: Truck,
  inventario: ClipboardList,
  reportes_wms: BarChart3,
}

const SUBMODULE_COLORS: Record<string, string> = {
  almacenes: 'text-cyan-600 bg-cyan-100',
  stock: 'text-emerald-600 bg-emerald-100',
  movimientos: 'text-blue-600 bg-blue-100',
  transferencias: 'text-purple-600 bg-purple-100',
  kardex: 'text-amber-600 bg-amber-100',
  reservas: 'text-rose-600 bg-rose-100',
  valorizacion: 'text-green-600 bg-green-100',
  reposicion: 'text-orange-600 bg-orange-100',
  ajustes: 'text-slate-600 bg-slate-100',
  'costo-promedio': 'text-violet-600 bg-violet-100',
  reportes: 'text-gray-600 bg-gray-100',
  conteos: 'text-indigo-600 bg-indigo-100',
  ubicaciones: 'text-teal-600 bg-teal-100',
  'lotes-series': 'text-yellow-600 bg-yellow-50',
  'ordenes-compra': 'text-rose-600 bg-rose-100',
  proveedores: 'text-orange-600 bg-orange-100',
  solicitudes: 'text-amber-600 bg-amber-100',
  evaluacion: 'text-purple-600 bg-purple-100',
  contratos: 'text-blue-600 bg-blue-100',
  cotizaciones: 'text-cyan-600 bg-cyan-100',
  'ordenes-venta': 'text-emerald-600 bg-emerald-100',
  clientes: 'text-indigo-600 bg-indigo-100',
  'listas-precios': 'text-pink-600 bg-pink-100',
  'condiciones-comerciales': 'text-slate-600 bg-slate-100',
  'comisiones-vendedores': 'text-green-600 bg-green-100',
}

type ModuleState = 'visible' | 'auth_required' | 'hidden'

const STATE_META: Record<ModuleState, { label: string; desc: string; icon: LucideIcon }> = {
  visible: {
    label: 'Visible',
    desc: 'Todos los del rol lo ven y lo usan normalmente.',
    icon: Eye,
  },
  auth_required: {
    label: 'Visible, pero requiere autorización',
    desc: 'Lo ven, pero deben solicitar autorización (a su superior) para poder usarlo.',
    icon: Lock,
  },
  hidden: {
    label: 'Oculto',
    desc: 'No aparece para el rol. No lo ve ni lo puede solicitar.',
    icon: EyeOff,
  },
}

const STATE_ORDER: ModuleState[] = ['visible', 'auth_required', 'hidden']

const STATE_COLORS: Record<ModuleState, { card: string; dot: string; icon: string; text: string }> = {
  visible: { card: 'border-emerald-400 bg-emerald-50', dot: 'bg-emerald-600', icon: 'text-emerald-600', text: 'text-emerald-800' },
  auth_required: { card: 'border-amber-400 bg-amber-50', dot: 'bg-amber-600', icon: 'text-amber-600', text: 'text-amber-800' },
  hidden: { card: 'border-red-400 bg-red-50', dot: 'bg-red-600', icon: 'text-red-600', text: 'text-red-800' },
}

const STATE_BG_BORDERS: Record<string, string> = {
  IAM: 'border-l-blue-500 bg-blue-50/50',
  ERP: 'border-l-emerald-500 bg-emerald-50/50',
  POS: 'border-l-amber-500 bg-amber-50/50',
  WMS: 'border-l-purple-500 bg-purple-50/50',
  RRHH: 'border-l-rose-500 bg-rose-50/50',
}

export default function PermissionsPage() {
  const companyId = useActiveCompanyId()
  if (!companyId)
    return <p className="py-12 text-center text-sm text-muted-foreground">Selecciona una empresa para configurar permisos.</p>
  return <PermissionsContent companyId={companyId} />
}

function PermissionsContent({ companyId }: { companyId: string }) {
  const { data: roles = [] } = useRoles(companyId)
  const { data: sections = [] } = useMenu()

  const initialRol = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('rol') ?? ''
    : ''
  const [selectedRoleId, setSelectedRoleId] = useState(initialRol)
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [selectedModuleCode, setSelectedModuleCode] = useState<string | null>(null)
  const [modalItem, setModalItem] = useState<{ name: string; code: string; type: 'system' | 'module' | 'submodule' } | null>(null)
  const [modalState, setModalState] = useState<ModuleState>('visible')

  const selectedRole = roles.find((r) => r.id === selectedRoleId)
  const selectedSystemData = selectedSystem ? sections.find((s) => s.systemCode === selectedSystem) : null

  const handleRoleChange = (id: string | null) => {
    setSelectedRoleId(id ?? '')
    setSelectedSystem(null)
    window.history.replaceState(null, '', `?rol=${id ?? ''}`)
  }

  const openSystemModal = (section: { systemCode: string; systemName: string }) => {
    setModalItem({ name: section.systemName, code: section.systemCode, type: 'system' })
    setModalState('visible')
  }

  const openModuleModal = (module: MenuModule) => {
    setModalItem({ name: module.label, code: module.code, type: 'module' })
    setModalState('visible')
  }

  const openSubModuleModal = (sub: { code: string; label: string }) => {
    setModalItem({ name: sub.label, code: sub.code, type: 'submodule' })
    setModalState('visible')
  }

  const selectedModule = selectedSystemData?.modules.find((m) => m.code === selectedModuleCode) ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
          <ShieldCheck className="size-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {selectedSystem && selectedRole && (
              <>
                <button onClick={() => setSelectedSystem(null)} className="hover:text-blue-600">Permisos por sistema</button>
                <ChevronRight className="size-3" />
                <button onClick={() => setSelectedModuleCode(null)} className="hover:text-blue-600">{selectedSystemData?.systemName}</button>
                {selectedModule && (
                  <>
                    <ChevronRight className="size-3" />
                    <span className="text-foreground font-medium">{selectedModule.label}</span>
                  </>
                )}
              </>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {selectedSystem && selectedRole && selectedModule
              ? `${selectedModule.label} · para el rol ${selectedRole.name}`
              : selectedSystem && selectedRole
                ? `${selectedSystemData?.systemName} · para el rol ${selectedRole.name}`
                : 'Permisos por sistema'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedSystem && selectedRole && selectedModule
              ? 'Configura los submódulos de esta sección.'
              : selectedSystem && selectedRole
                ? 'Configura qué módulos son visibles, requieren autorización u ocultos para este rol.'
                : 'Selecciona un rol y un sistema para configurar permisos.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/40 p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Rol</label>
          <Select value={selectedRoleId} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Seleccionar rol..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedRole && (
          <div className="text-sm ml-2">
            <span className="text-muted-foreground">Configurando: </span>
            <span className="font-semibold text-blue-600">{selectedRole.name}</span>
          </div>
        )}
      </div>

      {!selectedRoleId ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShieldCheck className="mb-3 size-12 opacity-30" />
          <p className="text-sm">Selecciona un rol para configurar permisos.</p>
        </div>
      ) : selectedSystem && selectedSystemData && selectedModule ? (
        <SubModuleListView
          module={selectedModule}
          systemName={selectedSystemData.systemName}
          onBack={() => setSelectedModuleCode(null)}
          onOpenSubModuleModal={(sub) => openSubModuleModal(sub)}
        />
      ) : selectedSystem && selectedSystemData ? (
        <ModuleListView
          systemData={selectedSystemData}
          onBack={() => setSelectedSystem(null)}
          onOpenModuleModal={openModuleModal}
          onViewSubModules={(m) => setSelectedModuleCode(m.code)}
        />
      ) : (
        <SystemGrid
          sections={sections}
          onOpenModal={openSystemModal}
          onViewModules={setSelectedSystem}
        />
      )}

      <PermissionModal
        companyId={companyId}
        item={modalItem}
        role={selectedRole ?? null}
        state={modalState}
        onStateChange={setModalState}
        onClose={() => setModalItem(null)}
      />
    </div>
  )
}

function SystemGrid({ sections, onOpenModal, onViewModules }: {
  sections: { systemCode: string; systemName: string; modules: unknown[] }[]
  onOpenModal: (section: { systemCode: string; systemName: string }) => void
  onViewModules: (code: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {sections.filter((s) => s.modules.length > 0).map((section) => {
        const SysIcon = SYSTEM_ICONS[section.systemCode] ?? ShieldCheck
        const border = STATE_BG_BORDERS[section.systemCode] ?? 'border-l-blue-500 bg-blue-50/50'
        return (
          <Card key={section.systemCode} size="sm" className={`relative border-l-4 ${border}`}>
            <div className="cursor-pointer" onClick={() => onOpenModal(section)}>
              <CardHeader className="flex-row items-center gap-3 py-3">
                <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                  <SysIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-semibold truncate">{section.systemName}</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {section.modules.length} módulo{section.modules.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </CardHeader>
            </div>
            <button
              onClick={() => onViewModules(section.systemCode)}
              className="absolute bottom-1 right-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-blue-700"
            >
              Ver módulos
            </button>
          </Card>
        )
      })}
    </div>
  )
}

function ModuleListView({ systemData, onBack, onOpenModuleModal, onViewSubModules }: {
  systemData: { systemCode: string; systemName: string; modules: MenuModule[] }
  onBack: () => void
  onOpenModuleModal: (module: MenuModule) => void
  onViewSubModules: (module: MenuModule) => void
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" /> Volver a sistemas
      </Button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {systemData.modules.map((module) => {
          const Icon = MODULE_ICONS[module.code] ?? Folder
          const colors = MODULE_COLORS[module.code] ?? 'text-gray-600 bg-gray-100'
          const subCount = module.submodules.length
          return (
            <Card key={module.code} className="relative border-2 border-transparent transition-all hover:border-gray-200 hover:shadow-md">
              <div className="cursor-pointer" onClick={() => onOpenModuleModal(module)}>
                <CardHeader className="flex-row items-start gap-4 py-4 px-5">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colors}`}>
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <CardTitle className="text-base font-semibold">{module.label}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {subCount > 0
                        ? `${subCount} submódulo${subCount !== 1 ? 's' : ''} disponible${subCount !== 1 ? 's' : ''}`
                        : 'Módulo sin submódulos'}
                    </p>
                  </div>
                </CardHeader>
              </div>
              {subCount > 0 && (
                <button
                  onClick={() => onViewSubModules(module)}
                  className="absolute bottom-2 right-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-blue-700"
                >
                  Ver submódulos
                </button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function SubModuleListView({ module, systemName, onBack, onOpenSubModuleModal }: {
  module: MenuModule
  systemName: string
  onBack: () => void
  onOpenSubModuleModal: (sub: { code: string; label: string }) => void
}) {
  const navigate = useNavigate()
  const [actionsSub, setActionsSub] = useState<string | null>(null)
  const search = new URLSearchParams(window.location.search)
  const rolId = search.get('rol') ?? ''

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" /> Volver a {systemName}
      </Button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {module.submodules.map((sub) => {
          const Icon = SUBMODULE_ICONS[sub.code] ?? Folder
          const colors = SUBMODULE_COLORS[sub.code] ?? 'text-gray-600 bg-gray-100'
          return (
            <Card key={sub.code} className="relative border-2 border-transparent transition-all hover:border-gray-200 hover:shadow-md">
              <div className="cursor-pointer" onClick={() => onOpenSubModuleModal(sub)}>
                <CardHeader className="flex-row items-center gap-4 py-4 px-5">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold">{sub.label}</CardTitle>
                  </div>
                </CardHeader>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setActionsSub(sub.label) }}
                  className="flex size-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-500 transition-colors hover:border-amber-400 hover:text-amber-600"
                  title="Permisos de acciones"
                >
                  <Eye className="size-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate({ to: '/iam/config-view', search: { sub: sub.label, rol: rolId } } as never) }}
                  className="rounded border border-amber-500 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  Config. Vista
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      <ActionsPermissionModal
        open={!!actionsSub}
        submoduleName={actionsSub ?? ''}
        onClose={() => setActionsSub(null)}
      />
    </div>
  )
}

function PermissionModal({ companyId, item, role, state, onStateChange, onClose }: {
  companyId: string
  item: { name: string; code: string; type: 'system' | 'module' | 'submodule' } | null
  role: { id: string; name: string } | null
  state: ModuleState
  onStateChange: (s: ModuleState) => void
  onClose: () => void
}) {
  const [approverType, setApproverType] = useState<'jerarquia' | 'usuario'>('jerarquia')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const { data: users } = useUsers(companyId, { page: 1, size: 100 })

  if (!item || !role) return null

  const title = item.type === 'system'
    ? `Permiso del sistema ${item.name}`
    : item.type === 'module'
      ? `Permiso del módulo ${item.name}`
      : `Permiso de ${item.name}`

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>
            para el rol {role.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {STATE_ORDER.map((key) => {
            const info = STATE_META[key]
            const Icon = info.icon
            const c = STATE_COLORS[key]
            const isSelected = state === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onStateChange(key)}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  isSelected ? c.card : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <span className={cn(
                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                  isSelected ? `${c.dot} border-transparent` : 'border-gray-300',
                )}>
                  {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('size-4', c.icon)} />
                    <span className={cn('text-sm font-semibold', c.text)}>{info.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{info.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {state === 'auth_required' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-3">¿Quién aprueba?</p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setApproverType('jerarquia')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border bg-white p-3 text-left transition-all',
                  approverType === 'jerarquia' ? 'border-amber-400' : 'border-amber-200',
                )}
              >
                <span className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                  approverType === 'jerarquia' ? 'border-amber-600 bg-amber-600' : 'border-gray-300',
                )}>
                  {approverType === 'jerarquia' && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-sm font-medium">Sube al rol superior en la jerarquía</span>
              </button>

              <button
                type="button"
                onClick={() => setApproverType('usuario')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border bg-white p-3 text-left transition-all',
                  approverType === 'usuario' ? 'border-amber-400' : 'border-amber-200',
                )}
              >
                <span className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                  approverType === 'usuario' ? 'border-amber-600 bg-amber-600' : 'border-gray-300',
                )}>
                  {approverType === 'usuario' && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-sm font-medium">Un usuario específico</span>
              </button>
            </div>

            {approverType === 'usuario' && (
              <div className="mt-3">
                <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? '')}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.items?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.fullName} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
