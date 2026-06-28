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
import CompanyDetailPage from '@/features/iam/pages/CompanyDetailPage'
import UsersPage from '@/features/iam/pages/UsersPage'
import RolesPage from '@/features/iam/pages/RolesPage'
import PermissionsPage from '@/features/iam/pages/PermissionsPage'
import ProfilePage from '@/features/iam/pages/ProfilePage'
import UnitsPage from '@/features/erp/pages/UnitsPage'
import ProductsPage from '@/features/erp/pages/ProductsPage'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.LOGIN,
  component: LoginPage,
  beforeLoad: () => {
    if (useAuthStore.getState().accessToken) throw redirect({ to: ROUTES.DASHBOARD })
  },
})

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: AppShell,
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      const slug = useAuthStore.getState().companySlug
      throw redirect({ to: ROUTES.LOGIN, search: slug ? { empresa: slug } : undefined })
    }
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

const companyDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.COMPANY_DETAIL,
  component: CompanyDetailPage,
})

const validateCompanyId = (input: Record<string, unknown>) => ({
  companyId: typeof input.companyId === 'string' ? input.companyId : undefined,
})

const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.USERS,
  component: UsersPage,
  validateSearch: validateCompanyId,
})

const rolesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ROLES,
  component: RolesPage,
  validateSearch: validateCompanyId,
})

const permissionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.PERMISSIONS,
  component: PermissionsPage,
  validateSearch: validateCompanyId,
})

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.PROFILE,
  component: ProfilePage,
})

const erpUnitsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_UNITS,
  component: UnitsPage,
})

const erpProductsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_PRODUCTS,
  component: ProductsPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    companiesRoute,
    companyDetailRoute,
    usersRoute,
    rolesRoute,
    permissionsRoute,
    profileRoute,
    erpUnitsRoute,
    erpProductsRoute,
  ]),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
