import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/features/auth/queries/useAuth'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

  const onLogout = () =>
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: ROUTES.LOGIN }),
    })

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="text-sm text-muted-foreground">
        {user?.isOwner ? 'Plataforma' : (user?.companyId ? 'Empresa' : '')}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{user?.fullName}</span>
        <Button variant="ghost" size="sm" onClick={onLogout} disabled={logout.isPending}>
          <LogOut className="size-4" /> Salir
        </Button>
      </div>
    </header>
  )
}
