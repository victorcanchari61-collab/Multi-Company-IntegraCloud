import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '@/app/core/state/auth.state';

/** Evita que un usuario ya autenticado vuelva a ver /login. */
export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);
  return authState.isAuthenticated() ? router.parseUrl('/') : true;
};
