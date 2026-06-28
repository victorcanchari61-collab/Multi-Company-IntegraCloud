import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  Ruler,
  ShoppingCart,
  Package,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import logo from '@/assets/bravic-logo.png'
import { cn } from '@/lib/utils'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useMenu } from '@/features/auth/queries/useMenu'

const SYSTEM_ICONS: Record<string, LucideIcon> = {
  IAM: ShieldCheck,
  ERP: Ruler,
  POS: ShoppingCart,
  WMS: Package,
  RRHH: UserCheck,
}

const MODULE_ICONS: Record<string, LucideIcon> = {
  users: Users,
  roles: ShieldCheck,
  companies: Building2,
  units: Ruler,
}

export function Sidebar() {
  const { data: sections = [] } = useMenu()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const hidden = useSidebarStore((s) => s.hidden)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(sections.map(s => s.systemCode)))

  const toggleSection = (code: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const baseItems = [
    { to: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
  ]

  const sidebarClasses = cn(
    'flex shrink-0 flex-col overflow-hidden bg-white text-foreground transition-all duration-300 ease-in-out',
    hidden ? 'w-0' : collapsed ? 'w-16' : 'w-47',
  )

  const linkBase = cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors',
    'hover:bg-blue-50 hover:text-blue-700',
    '[&.active]:bg-blue-100 [&.active]:font-medium [&.active]:text-blue-700',
  )

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary p-1">
          <img src={logo} alt={APP_NAME} className="size-full object-contain" />
        </span>
        <span className={cn('truncate text-sm font-semibold tracking-wide transition-opacity duration-200', collapsed && 'opacity-0')}>
          {APP_NAME}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {baseItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            activeOptions={{ exact: to === ROUTES.DASHBOARD }}
            className={cn(linkBase, collapsed && 'justify-center px-0')}
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn('truncate', collapsed && 'hidden')}>{label}</span>
          </Link>
        ))}

        {!collapsed && sections.map(section => {
          const Icon = SYSTEM_ICONS[section.systemCode] ?? ShieldCheck
          const isExpanded = expanded.has(section.systemCode)

          return (
            <div key={section.systemCode}>
              <button
                type="button"
                onClick={() => toggleSection(section.systemCode)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate text-left font-medium">{section.systemName}</span>
                <ChevronDown className={cn('size-3 transition-transform', isExpanded && 'rotate-180')} />
              </button>

              {isExpanded && (
                <div className="ml-2 space-y-0.5 pl-2">
                  {section.items.map(item => {
                    const ModIcon = MODULE_ICONS[item.code] ?? ChevronsRight
                    return (
                      <Link
                        key={item.route}
                        to={item.route}
                        title={item.label}
                        className="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-blue-50 hover:text-blue-700 [&.active]:text-blue-700"
                      >
                        <ModIcon className="size-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
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
