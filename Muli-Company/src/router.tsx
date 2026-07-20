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
import OrganigramaPage from '@/features/iam/pages/OrganigramaPage'
import NotificationsPage from '@/features/iam/pages/NotificationsPage'
import ConfigViewPage from '@/features/iam/pages/ConfigViewPage'
import ProductsPage from '@/features/erp/pages/ProductsPage'
import InventoryPage from '@/features/erp/pages/InventoryPage'
import AlmacenesPage from '@/features/erp/pages/inventory/AlmacenesPage'
import StockPage from '@/features/erp/pages/inventory/StockPage'
import MovimientosPage from '@/features/erp/pages/inventory/MovimientosPage'
import TransferenciasPage from '@/features/erp/pages/inventory/TransferenciasPage'
import ReportesPage from '@/features/erp/pages/inventory/ReportesPage'
import KardexPage from '@/features/erp/pages/inventory/KardexPage'
import ReservasPage from '@/features/erp/pages/inventory/ReservasPage'
import ValorizacionPage from '@/features/erp/pages/inventory/ValorizacionPage'
import ReposicionPage from '@/features/erp/pages/inventory/ReposicionPage'
import AjustesPage from '@/features/erp/pages/inventory/AjustesPage'
import CostoPromedioPage from '@/features/erp/pages/inventory/CostoPromedioPage'
import UbicacionesPage from '@/features/erp/pages/inventory/UbicacionesPage'
import LotesSeriesPage from '@/features/erp/pages/inventory/LotesSeriesPage'
import ConteosPage from '@/features/erp/pages/inventory/ConteosPage'
import WmsViewPage from '@/features/erp/pages/WmsViewPage'
import ComprasPage from '@/features/erp/pages/ComprasPage'
import OrdenesCompraPage from '@/features/erp/pages/purchases/OrdenesCompraPage'
import ProveedoresPage from '@/features/erp/pages/purchases/ProveedoresPage'
import SolicitudesPage from '@/features/erp/pages/purchases/SolicitudesPage'
import EvaluacionPage from '@/features/erp/pages/purchases/EvaluacionPage'
import ContratosPage from '@/features/erp/pages/purchases/ContratosPage'
import VentasPage from '@/features/erp/pages/VentasPage'
import ClientesPage from '@/features/erp/pages/sales/ClientesPage'
import ListasPreciosPage from '@/features/erp/pages/sales/ListasPreciosPage'
import CondicionesComercialesPage from '@/features/erp/pages/sales/CondicionesComercialesPage'
import ComisionesPage from '@/features/erp/pages/sales/ComisionesPage'
import CotizacionesPage from '@/features/erp/pages/sales/CotizacionesPage'
import OrdenesVentaPage from '@/features/erp/pages/sales/OrdenesVentaPage'

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

const organigramaRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ORGANIGRAMA,
  component: OrganigramaPage,
  validateSearch: validateCompanyId,
})

const notificationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.NOTIFICATIONS,
  component: NotificationsPage,
})

const configViewRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/iam/config-view',
  component: ConfigViewPage,
})

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.PROFILE,
  component: ProfilePage,
})

const erpProductsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_PRODUCTS,
  component: ProductsPage,
})

const erpInventoryRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY,
  component: InventoryPage,
})

const erpInventoryAlmacenesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_ALMACENES,
  component: AlmacenesPage,
})

const erpInventoryStockRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_STOCK,
  component: StockPage,
})

const erpInventoryMovimientosRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_MOVIMIENTOS,
  component: MovimientosPage,
})

const erpInventoryTransferenciasRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_TRANSFERENCIAS,
  component: TransferenciasPage,
})

const erpInventoryReservasRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_RESERVAS,
  component: ReservasPage,
})

const erpInventoryValorizacionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_VALORIZACION,
  component: ValorizacionPage,
})

const erpInventoryReposicionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_REPOSICION,
  component: ReposicionPage,
})

const erpInventoryAjustesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_AJUSTES,
  component: AjustesPage,
})

const erpInventoryUbicacionesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_UBICACIONES,
  component: UbicacionesPage,
})

const erpInventoryLotesSeriesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_LOTES_SERIES,
  component: LotesSeriesPage,
})

const erpInventoryConteosRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_CONTEOS,
  component: ConteosPage,
})

const erpInventoryCostoPromedioRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_COSTO_PROMEDIO,
  component: CostoPromedioPage,
})

// ── WMS: una sola ruta dinámica para todos los submódulos del doc ──
const wmsViewRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/wms/$moduleCode/$viewCode',
  component: WmsViewPage,
})

const erpInventoryReportesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_REPORTES,
  component: ReportesPage,
})

const erpInventoryKardexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_INVENTORY_KARDEX,
  component: KardexPage,
})

// ── ERP / Compras ──
const erpComprasRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_COMPRAS,
  component: ComprasPage,
})

const erpComprasOrdenesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_COMPRAS_ORDENES,
  component: OrdenesCompraPage,
})

const erpComprasProveedoresRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_COMPRAS_PROVEEDORES,
  component: ProveedoresPage,
})

const erpComprasSolicitudesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_COMPRAS_SOLICITUDES,
  component: SolicitudesPage,
})

const erpComprasEvaluacionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_COMPRAS_EVALUACION,
  component: EvaluacionPage,
})

const erpComprasContratosRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_COMPRAS_CONTRATOS,
  component: ContratosPage,
})

// ── ERP / Ventas ──
const erpVentasRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS,
  component: VentasPage,
})

const erpVentasCotizacionesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS_COTIZACIONES,
  component: CotizacionesPage,
})

const erpVentasOrdenesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS_ORDENES,
  component: OrdenesVentaPage,
})

const erpVentasClientesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS_CLIENTES,
  component: ClientesPage,
})

const erpVentasListasRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS_LISTAS,
  component: ListasPreciosPage,
})

const erpVentasCondicionesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS_CONDICIONES,
  component: CondicionesComercialesPage,
})

const erpVentasComisionesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ERP_VENTAS_COMISIONES,
  component: ComisionesPage,
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
    organigramaRoute,
    notificationsRoute,
    configViewRoute,
    profileRoute,
    erpProductsRoute,
    erpInventoryRoute,
    erpInventoryAlmacenesRoute,
    erpInventoryStockRoute,
    erpInventoryMovimientosRoute,
    erpInventoryTransferenciasRoute,
    erpInventoryReportesRoute,
    erpInventoryKardexRoute,
    erpInventoryReservasRoute,
    erpInventoryValorizacionRoute,
    erpInventoryReposicionRoute,
    erpInventoryAjustesRoute,
    erpInventoryUbicacionesRoute,
    erpInventoryLotesSeriesRoute,
    erpInventoryConteosRoute,
    erpInventoryCostoPromedioRoute,
    erpComprasRoute,
    erpComprasOrdenesRoute,
    erpComprasProveedoresRoute,
    erpComprasSolicitudesRoute,
    erpComprasEvaluacionRoute,
    erpComprasContratosRoute,
    erpVentasRoute,
    erpVentasCotizacionesRoute,
    erpVentasOrdenesRoute,
    erpVentasClientesRoute,
    erpVentasListasRoute,
    erpVentasCondicionesRoute,
    erpVentasComisionesRoute,
    wmsViewRoute,
  ]),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
