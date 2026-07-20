import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthState } from '@/app/core/state/auth.state';
import { AuthService } from '@/app/features/iam/auth/services/auth.service';

/**
 * Protege rutas privadas. Si hay sesión pero aún no se cargó el usuario
 * (p.ej. recarga de página), rehidrata `me` + permisos antes de dejar pasar.
 */
export const authGuard: CanActivateFn = async () => {
  const authState = inject(AuthState);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) return router.parseUrl('/login');

  if (!authState.user()) {
    try {
      const [me, permissions] = await Promise.all([
        firstValueFrom(authService.getMe()),
        firstValueFrom(authService.getMyPermissions()),
      ]);
      authState.setUser(me);
      authState.setPermissions(permissions);
    } catch {
      authState.clear();
      return router.parseUrl('/login');
    }
  }

  return true;
};
