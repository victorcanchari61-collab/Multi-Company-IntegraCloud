import { Routes } from '@angular/router';

// Rutas del módulo IAM bajo /iam/*. El sidebar de IAM lo monta el Shell (ver
// core/layout/shell), detectando el sistema activo por la URL.
// "companies" es exclusivo del dueño del software (crea/administra empresas); el resto es IAM
// de la propia empresa (cada empresa administra sus usuarios, roles y permisos).
// permissions/notifications/organigrama se agregan después.
export const IAM_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/pages/users-page/users-page').then((m) => m.UsersPage),
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/pages/roles-page/roles-page').then((m) => m.RolesPage),
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/pages/companies-page/companies-page').then((m) => m.CompaniesPage),
  },
];
