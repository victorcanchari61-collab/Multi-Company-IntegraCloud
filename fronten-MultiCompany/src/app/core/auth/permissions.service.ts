import { Injectable, inject } from '@angular/core';
import { AuthState } from '@/app/core/state/auth.state';

/**
 * Modelo de permisos por blacklist (igual que usePermissions.ts en React): todo está permitido
 * por defecto salvo que la key esté en allRestrictions. El Owner de la plataforma nunca restringe.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly authState = inject(AuthState);

  can(required: string): boolean {
    return this.authState.user()?.isOwner === true || !this.authState.allRestrictions().includes(required);
  }

  canAny(required: string[]): boolean {
    return required.some((key) => this.can(key));
  }

  canAll(required: string[]): boolean {
    return required.every((key) => this.can(key));
  }
}
