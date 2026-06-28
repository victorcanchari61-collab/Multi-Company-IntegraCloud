import { useState } from 'react'
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
  companies: Building2,
  productos: Boxes,
  units: Ruler,
}

const linkBase =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-blue-50 hover:text-blue-700 [&.active]:bg-blue-100 [&.active]:font-medium [&.active]:text-blue-700'

export function Sidebar() {
  const { data: sections = [] } = useMenu()
  const { can } = usePermissions()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const hidden = useSidebarStore((s) => s.hidden)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)

  // Guardamos los nodos CERRADOS; por defecto todo abierto.
  const [closed, setClosed] = useState<Set<string>>(new Set())
  const isOpen = (key: string) => !closed.has(key)
  const toggle = (key: string) =>
    setClosed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const sidebarClasses = cn(
    'flex shrink-0 flex-col overflow-hidden bg-white text-foreground transition-all duration-300 ease-in-out',
    hidden ? 'w-0' : collapsed ? 'w-16' : 'w-56',
  )

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary p-1">
          <img src={logo} alt={APP_NAME} className="size-full object-contain" />
        </span>
        <span
          className={cn(
            'truncate text-sm font-semibold tracking-wide transition-opacity duration-200',
            collapsed && 'opacity-0',
          )}
        >
          {APP_NAME}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {/* Inicio */}
        <Link
          to={ROUTES.DASHBOARD}
          title={collapsed ? 'Inicio' : undefined}
          activeOptions={{ exact: true }}
          className={cn(linkBase, collapsed && 'justify-center px-0')}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          <span className={cn('truncate', collapsed && 'hidden')}>Inicio</span>
        </Link>

        {!collapsed &&
          sections
            .map((section) => ({
              ...section,
              modules: section.modules
                .filter((m) => !m.requiredPermission || can(m.requiredPermission))
                .map((m) => ({
                  ...m,
                  submodules: m.submodules.filter(
                    (s) => !s.requiredPermission || can(s.requiredPermission),
                  ),
                })),
            }))
            .filter((section) => section.modules.length > 0)
            .map((section) => {
              const SysIcon = SYSTEM_ICONS[section.systemCode] ?? ShieldCheck
              const sysOpen = isOpen(section.systemCode)
              return (
                <div key={section.systemCode}>
                  {/* Nivel 1: Sistema */}
                  <button
                    type="button"
                    onClick={() => toggle(section.systemCode)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <SysIcon className="size-4 shrink-0" />
                    <span className="flex-1 truncate text-left">{section.systemName}</span>
                    <ChevronDown className={cn('size-3 transition-transform', !sysOpen && '-rotate-90')} />
                  </button>

                  {sysOpen && (
                    <div className="ml-3 space-y-0.5 pl-2">
                      {section.modules.map((module) => {
                        const ModIcon = MODULE_ICONS[module.code] ?? Folder

                        // Módulo GRUPO (con submódulos)
                        if (module.submodules.length > 0) {
                          const modKey = `${section.systemCode}/${module.code}`
                          const modOpen = isOpen(modKey)
                          const header = module.route ? (
                            <Link
                              to={module.route}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-blue-50 hover:text-blue-700 [&.active]:bg-blue-100 [&.active]:font-medium [&.active]:text-blue-700"
                              onClick={() => setTimeout(() => toggle(modKey), 0)}
                            >
                              <ModIcon className="size-3.5 shrink-0" />
                              <span className="flex-1 truncate text-left">{module.label}</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggle(modKey)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            >
                              <ModIcon className="size-3.5 shrink-0" />
                              <span className="flex-1 truncate text-left">{module.label}</span>
                            </button>
                          )
                          return (
                            <div key={module.code}>
                              <div className="flex items-center">
                                {header}
                                <button
                                  type="button"
                                  onClick={() => toggle(modKey)}
                                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                  title={modOpen ? 'Contraer' : 'Expandir'}
                                >
                                  <ChevronDown
                                    className={cn('size-3 transition-transform', !modOpen && '-rotate-90')}
                                  />
                                </button>
                              </div>
                              {modOpen && (
                                <div className="ml-3 space-y-0.5 pl-2">
                                  {module.submodules.map((sub) => (
                                    <Link
                                      key={sub.route}
                                      to={sub.route}
                                      title={sub.label}
                                      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground/75 transition-colors hover:bg-blue-50 hover:text-blue-700 [&.active]:bg-blue-100 [&.active]:font-medium [&.active]:text-blue-700"
                                    >
                                      <span className="truncate">{sub.label}</span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        }

                        // Módulo HOJA (link directo)
                        return (
                          <Link
                            key={module.code}
                            to={module.route ?? '#'}
                            title={module.label}
                            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-blue-50 hover:text-blue-700 [&.active]:bg-blue-100 [&.active]:font-medium [&.active]:text-blue-700"
                          >
                            <ModIcon className="size-3.5 shrink-0" />
                            <span className="truncate">{module.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
      </nav>

      <div className="border-t p-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Desplegar' : 'Contraer'}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-blue-50 hover:text-blue-700',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <ChevronsRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="size-4 shrink-0" />
              <span>Contraer</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
