import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, PanelLeft, UserCircle } from 'lucide-react'
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

const ghostDark = 'text-white hover:bg-white/10 hover:text-white'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const hidden = useSidebarStore((s) => s.hidden)
  const toggleHidden = useSidebarStore((s) => s.toggleHidden)
  const logout = useLogout()
  const navigate = useNavigate()

  const onLogout = () => {
    const slug = useAuthStore.getState().companySlug
    logout.mutate(undefined, {
      onSettled: () => {
        navigate({ to: ROUTES.LOGIN, search: slug ? { empresa: slug } : undefined })
      },
    })
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-white/10 bg-[#0b4c8c] px-4 text-white">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleHidden}
          title={hidden ? 'Mostrar menú' : 'Ocultar menú'}
          className={ghostDark}
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
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-white p-0.5">
            <img src={logo} alt={APP_NAME} className="size-full object-contain" />
          </span>
          <span className="text-sm font-semibold tracking-wide">{APP_NAME}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-white">{user?.fullName}</p>
          <p className="text-xs text-white">
            {user?.isOwner ? 'Propietario' : 'Empresa'}
          </p>
        </div>
        <Link
          to={ROUTES.PROFILE}
          title="Mi perfil"
          className="flex size-9 items-center justify-center rounded-full bg-primary-foreground text-xs font-semibold text-primary transition-colors hover:bg-white/90"
        >
          {user?.fullName ? initials(user.fullName) : <UserCircle className="size-5" />}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          disabled={logout.isPending}
          title="Cerrar sesión"
          className={ghostDark}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
