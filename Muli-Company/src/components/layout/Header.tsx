import { useNavigate } from '@tanstack/react-router'
import { LogOut, PanelLeft } from 'lucide-react'
import logo from '@/assets/bravic-logo.png'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useLogout } from '@/features/auth/queries/useAuth'

function initials(name?: string): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function Header() {
  const user = useAuthStore((s) => s.user)
  const hidden = useSidebarStore((s) => s.hidden)
  const toggleHidden = useSidebarStore((s) => s.toggleHidden)
  const logout = useLogout()
  const navigate = useNavigate()

  const onLogout = () =>
    logout.mutate(undefined, { onSettled: () => navigate({ to: ROUTES.LOGIN }) })

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleHidden}
          title={hidden ? 'Mostrar menú' : 'Ocultar menú'}
        >
          <PanelLeft className="size-5" />
        </Button>

        {/* Cuando el sidebar está oculto, la marca aparece en el navbar */}
        <div
          className={cn(
            'flex items-center gap-2 transition-all duration-300',
            hidden ? 'opacity-100' : 'pointer-events-none w-0 opacity-0',
          )}
        >
          <img src={logo} alt={APP_NAME} className="size-7 object-contain" />
          <span className="text-sm font-semibold tracking-wide">{APP_NAME}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {user?.isOwner ? 'Propietario' : 'Empresa'}
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(user?.fullName)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          disabled={logout.isPending}
          title="Cerrar sesión"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
