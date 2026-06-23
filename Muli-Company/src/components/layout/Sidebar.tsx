import { Link } from '@tanstack/react-router'
import { Building2, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  permission?: string
}

const NAV: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
  { to: ROUTES.COMPANIES, label: 'Empresas', icon: Building2, permission: 'iam.companies.read' },
  { to: ROUTES.USERS, label: 'Usuarios', icon: Users, permission: 'iam.users.read' },
  { to: ROUTES.ROLES, label: 'Roles', icon: ShieldCheck, permission: 'iam.roles.read' },
]

export function Sidebar() {
  const { can, isOwner } = usePermissions()
  const items = NAV.filter((item) => !item.permission || isOwner || can(item.permission))

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
      <div className="flex h-14 items-center px-6 font-semibold">IntegraCloud</div>
      <nav className="space-y-1 p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === ROUTES.DASHBOARD }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
