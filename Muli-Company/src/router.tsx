import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import CompaniesPage from '@/features/iam/pages/CompaniesPage'
import UsersPage from '@/features/iam/pages/UsersPage'
import RolesPage from '@/features/iam/pages/RolesPage'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.LOGIN,
  component: LoginPage,
  beforeLoad: () => {
    if (useAuthStore.getState().accessToken) throw redirect({ to: ROUTES.DASHBOARD })
  },
})

// Layout protegido: exige sesión. Los hijos se renderizan dentro del AppShell.
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: AppShell,
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) throw redirect({ to: ROUTES.LOGIN })
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.DASHBOARD,
  component: DashboardPage,
})

const companiesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.COMPANIES,
  component: CompaniesPage,
})

const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.USERS,
  component: UsersPage,
})

const rolesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ROLES,
  component: RolesPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([dashboardRoute, companiesRoute, usersRoute, rolesRoute]),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
