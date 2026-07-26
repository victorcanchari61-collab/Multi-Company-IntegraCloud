import { CanMatchFn, Routes, UrlSegment } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { SYSTEMS } from './core/constants/systems';

// La ruta genérica ':system' solo matchea keys reales (/erp, /crm, ...); cualquier otra URL
// cae al wildcard y vuelve al dashboard.
const systemExistsGuard: CanMatchFn = (_route, segments: UrlSegment[]) =>
  SYSTEMS.some((system) => system.key === segments[0]?.path);

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/iam/auth/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'iam',
        loadChildren: () => import('./features/iam/iam.routes').then((m) => m.IAM_ROUTES),
      },
      // Aterrizaje genérico por sistema (ERP, CRM, WMS, ...): el Shell monta el sidebar del
      // sistema detectado por la URL. Los sistemas con páginas reales (como /iam) se registran
      // ANTES de esta ruta para ganarle el match.
      {
        path: ':system',
        canMatch: [systemExistsGuard],
        loadComponent: () =>
          import('./features/systems/pages/system-home-page/system-home-page').then((m) => m.SystemHomePage),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
