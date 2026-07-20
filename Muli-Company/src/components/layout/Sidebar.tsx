import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@tanstack/react-router'
import {
  Boxes,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Folder,
  KeyRound,
  LayoutDashboard,
  Package,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  UserCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import logo from '@/assets/bravic-logo.png'
import { cn } from '@/lib/utils'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useMenu } from '@/features/auth/queries/useMenu'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

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
  organigrama: Building2,
  companies: Building2,
  productos: Boxes,
  inventario: Package,
  compras: ShoppingCart,
  ventas: ShoppingCart,
  units: Ruler,
}

const MODULE_LABELS: Record<string, string> = {
  productos: 'Productos',
  inventario: 'Inventario',
  compras: 'Compras',
}

const HIDDEN_SUBMODULE_CODES = new Set([
  'categorias',
  'subcategorias',
  'marcas',
  'submarcas',
  'unidades',
])

const animStyles = `
@keyframes sb-fly-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
@keyframes sb-fade-in { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
.animate-sb-fly-in { animation: sb-fly-in 0.15s ease-out both; }
.animate-sb-fade-in { animation: sb-fade-in 0.18s ease-out both; }
`

const linkBase =
  'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-blue-600 [&.active]:font-medium [&.active]:text-white'

const flyItem =
  'flex items-center rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-blue-600 [&.active]:font-medium [&.active]:text-white'

const flySubItem =
  'flex items-center rounded-md py-1 pr-2 pl-3 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-blue-600 [&.active]:font-medium [&.active]:text-white'

export function Sidebar() {
  const { data: sections = [] } = useMenu()
  const { can } = usePermissions()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const hidden = useSidebarStore((s) => s.hidden)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)

  // Nodos ABIERTOS (por defecto vacío = todo cerrado) para el modo expandido.
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())
  const isOpen = (key: string) => openKeys.has(key)
  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // Flyout del modo contraído (portal a body para que no lo recorte el overflow).
  const [fly, setFly] = useState<{ code: string; top: number; left: number } | null>(null)
  const closeTimer = useRef<number | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setFly(null), 140)
  }
  const openFly = (code: string, el: HTMLElement) => {
    cancelClose()
    const r = el.getBoundingClientRect()
    setFly({ code, top: r.top, left: r.right + 8 })
  }

  const ORG_MODULE = {
    code: 'organigrama',
    label: 'Organigrama',
    route: ROUTES.ORGANIGRAMA,
    requiredPermission: null,
    submodules: [] as { code: string; label: string; route: string; requiredPermission: string | null }[],
  }

  // Secciones visibles (permisos + submódulos ocultos), calculado una vez.
  const visibleSections = sections
    .map((section) => {
      const modules = section.modules
        .filter((m) => !m.requiredPermission || can(m.requiredPermission))
        .map((m) => ({
          ...m,
          submodules: m.submodules.filter(
            (s) =>
              !HIDDEN_SUBMODULE_CODES.has(s.code) &&
              (!s.requiredPermission || can(s.requiredPermission)),
          ),
        }))
      if (section.systemCode === 'IAM') {
        modules.push(ORG_MODULE as typeof modules[number])
      }
      return { ...section, modules }
    })
    .filter((section) => section.modules.length > 0)

  const flySection = fly ? visibleSections.find((s) => s.systemCode === fly.code) : undefined

  const sidebarClasses = cn(
    'flex shrink-0 flex-col overflow-hidden bg-[#0b4c8c] text-slate-100 transition-all duration-300 ease-in-out',
    hidden ? 'w-0' : collapsed ? 'w-14' : 'w-48',
  )

  return (
    <aside className={sidebarClasses}>
      <style>{animStyles}</style>

      <div className={cn('flex h-10 items-center gap-2 border-b border-white/10 px-2', collapsed && 'justify-center px-0')}>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary p-1">
          <img src={logo} alt={APP_NAME} className="size-full object-contain" />
        </span>
        {!collapsed && (
          <span className="truncate text-xs font-semibold tracking-wide">{APP_NAME}</span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto p-1.5">
        {/* Inicio */}
        <Link
          to={ROUTES.DASHBOARD}
          title="Inicio"
          activeOptions={{ exact: true }}
          className={cn(linkBase, collapsed && 'justify-center px-0')}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          {!collapsed && <span className="truncate">Inicio</span>}
        </Link>

        {collapsed
          ? /* ── Contraído: solo iconos de sistema + flyout al hover ── */
            visibleSections.map((section) => {
              const SysIcon = SYSTEM_ICONS[section.systemCode] ?? ShieldCheck
              return (
                <button
                  key={section.systemCode}
                  type="button"
                  title={section.systemName}
                  onMouseEnter={(e) => openFly(section.systemCode, e.currentTarget)}
                  onMouseLeave={scheduleClose}
                  className={cn(
                    'flex w-full justify-center rounded-md p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
                    fly?.code === section.systemCode && 'bg-white/10 text-white',
                  )}
                >
                  <SysIcon className="size-4 shrink-0" />
                </button>
              )
            })
          : /* ── Expandido: árbol Sistema → Módulo → Submódulo ── */
            visibleSections.map((section) => {
              const SysIcon = SYSTEM_ICONS[section.systemCode] ?? ShieldCheck
              const sysOpen = isOpen(section.systemCode)
              return (
                <div key={section.systemCode}>
                  <button
                    type="button"
                    onClick={() => toggle(section.systemCode)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <SysIcon className="size-4 shrink-0" />
                    <span className="flex-1 truncate text-left">{section.systemName}</span>
                    <ChevronDown className={cn('size-2.5 transition-transform duration-200', !sysOpen && '-rotate-90')} />
                  </button>

                  {sysOpen && (
                    <div className="animate-sb-fade-in ml-3 space-y-0.5 pl-2">
                      {section.modules.map((module) => {
                        const ModIcon = MODULE_ICONS[module.code] ?? Folder
                        const label = MODULE_LABELS[module.code] ?? module.label

                        if (module.submodules.length > 0) {
                          const modKey = `${section.systemCode}/${module.code}`
                          const modOpen = isOpen(modKey)
                          const header = module.route ? (
                            <Link
                              to={module.route}
                              activeOptions={{ exact: true }}
                              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-blue-600 [&.active]:font-medium [&.active]:text-white"
                            >
                              <ModIcon className="size-3 shrink-0" />
                              <span className="flex-1 truncate text-left">{label}</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggle(modKey)}
                              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <ModIcon className="size-3 shrink-0" />
                              <span className="flex-1 truncate text-left">{label}</span>
                            </button>
                          )
                          return (
                            <div key={module.code}>
                              <div className="flex items-center">
                                {header}
                                <button
                                  type="button"
                                  onClick={() => toggle(modKey)}
                                  className="flex size-5 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                                  title={modOpen ? 'Contraer' : 'Expandir'}
                                >
                                  <ChevronDown className={cn('size-3 transition-transform duration-200', !modOpen && '-rotate-90')} />
                                </button>
                              </div>
                              {modOpen && (
                    <div className="animate-sb-fade-in ml-2 space-y-0 pl-1">
                                  {module.submodules.map((sub) => (
                                      <Link
                                        key={sub.route}
                                        to={sub.route}
                                        title={sub.label}
                                        className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-blue-600 [&.active]:font-medium [&.active]:text-white"
                                      >
                                        <span className="truncate">{sub.label}</span>
                                      </Link>
                                    ))}
                                  </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <Link
                            key={module.code}
                            to={module.route ?? '#'}
                            title={label}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-blue-600 [&.active]:font-medium [&.active]:text-white"
                          >
                            <ModIcon className="size-3 shrink-0" />
                            <span className="truncate">{label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
      </nav>

      <div className="border-t border-white/10 p-1.5">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Desplegar' : 'Contraer'}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <ChevronsRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="size-3.5 shrink-0" />
              <span>Contraer</span>
            </>
          )}
        </button>
      </div>

      {/* Flyout del modo contraído */}
      {collapsed &&
        fly &&
        flySection &&
        createPortal(
          <div
            style={{ position: 'fixed', top: fly.top, left: fly.left, zIndex: 9999 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="animate-sb-fly-in w-48 rounded-lg border border-white/10 bg-[#0b4c8c] p-1 shadow-xl"
          >
            <p className="px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              {flySection.systemName}
            </p>
            {flySection.modules.map((module) => {
              const label = MODULE_LABELS[module.code] ?? module.label
              if (module.submodules.length > 0) {
                return (
                  <div key={module.code} className="mt-0.5">
                    {module.route ? (
                      <Link to={module.route} onClick={() => setFly(null)} className={flyItem}>
                        <span className="truncate">{label}</span>
                      </Link>
                    ) : (
                      <p className="px-2 pt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                        {label}
                      </p>
                    )}
                    {module.submodules.map((sub) => (
                      <Link
                        key={sub.route}
                        to={sub.route}
                        onClick={() => setFly(null)}
                        className={flySubItem}
                      >
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                )
              }
              return (
                <Link
                  key={module.code}
                  to={module.route ?? '#'}
                  onClick={() => setFly(null)}
                  className={flyItem}
                >
                  <span className="truncate">{label}</span>
                </Link>
              )
            })}
          </div>,
          document.body,
        )}
    </aside>
  )
}
