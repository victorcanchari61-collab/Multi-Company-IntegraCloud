import { Link } from '@tanstack/react-router'
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  Ruler,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import logo from '@/assets/bravic-logo.png'
import { cn } from '@/lib/utils'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { useSidebarStore } from '@/stores/sidebarStore'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

// Menú del DUEÑO DEL SISTEMA: administra la plataforma (empresas, licencias…).
const OWNER_NAV: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
  { to: ROUTES.COMPANIES, label: 'Empresas', icon: Building2 },
  { to: ROUTES.PROFILE, label: 'Mi perfil', icon: UserCircle },
]

// Menú de los USUARIOS DE UNA EMPRESA: operan su propia empresa.
const COMPANY_NAV: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
  { to: ROUTES.ERP_UNITS, label: 'Unidades', icon: Ruler },
  { to: ROUTES.USERS, label: 'Usuarios', icon: Users },
  { to: ROUTES.ROLES, label: 'Roles', icon: ShieldCheck },
  { to: ROUTES.PROFILE, label: 'Mi perfil', icon: UserCircle },
]

export function Sidebar() {
  const { isOwner } = usePermissions()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const hidden = useSidebarStore((s) => s.hidden)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)

  // Dos experiencias separadas: dueño del sistema vs. usuario de empresa.
  const items = isOwner ? OWNER_NAV : COMPANY_NAV

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-hidden bg-[#0b4c8c] text-white transition-all duration-300 ease-in-out',
        hidden ? 'w-0' : collapsed ? 'w-16' : 'w-47',
      )}
    >
      {/* Marca */}
      <div className="flex h-12 items-center gap-2 border-b border-primary-foreground/10 px-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white p-1">
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

      {/* Navegación */}
      <nav className="flex-1 space-y-1 p-2">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            activeOptions={{ exact: to === ROUTES.DASHBOARD }}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground [&.active]:bg-primary-foreground/15 [&.active]:font-medium [&.active]:text-primary-foreground',
              collapsed && 'justify-center px-0',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn('truncate', collapsed && 'hidden')}>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Contraer / desplegar */}
      <div className="border-t border-primary-foreground/10 p-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Desplegar' : 'Contraer'}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground',
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
