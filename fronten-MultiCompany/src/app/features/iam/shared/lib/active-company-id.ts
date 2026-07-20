import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthState } from '@/app/core/state/auth.state';

/**
 * Empresa activa para las pantallas de IAM (equivalente a useActiveCompanyId en React):
 * ?companyId= en la URL (para cuando el Owner navegue a una empresa puntual) o, si no,
 * la empresa del usuario logueado. Debe llamarse en contexto de inyección (campo de clase).
 */
export function activeCompanyId(): string | null {
  const route = inject(ActivatedRoute);
  const authState = inject(AuthState);
  return route.snapshot.queryParamMap.get('companyId') || authState.user()?.companyId || null;
}
