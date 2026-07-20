import { Routes } from '@angular/router';

// Rutas del módulo IAM bajo /iam/*. El sidebar de IAM lo monta el Shell (ver
// core/layout/shell), detectando el sistema activo por la URL. Users y Companies son las
// piezas funcionales; roles/permissions/notifications/organigrama se agregan después.
export const IAM_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/pages/users-page/users-page').then((m) => m.UsersPage),
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/pages/companies-page/companies-page').then((m) => m.CompaniesPage),
  },
];
