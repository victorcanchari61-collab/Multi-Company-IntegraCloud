import { Routes } from '@angular/router';

// Rutas del módulo IAM bajo /iam/*. El sidebar de IAM lo monta el Shell (ver
// core/layout/shell), detectando el sistema activo por la URL. Users es la primera pieza
// funcional; roles/companies/permissions/notifications/organigrama se agregan después.
export const IAM_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/pages/users-page/users-page').then((m) => m.UsersPage),
  },
];
