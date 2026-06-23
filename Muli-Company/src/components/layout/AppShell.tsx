import { Outlet } from '@tanstack/react-router'
import { useAuthBootstrap } from '@/features/auth/queries/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  // Rehidrata perfil + permisos efectivos cuando hay sesión persistida.
  useAuthBootstrap()

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
