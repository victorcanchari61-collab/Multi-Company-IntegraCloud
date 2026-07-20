import { Injectable, computed, signal } from '@angular/core';
import { STORAGE_KEYS } from '@/app/core/constants/storage-keys';
import type { AuthTokens, AuthUser } from '@/app/features/iam/auth/models/auth.model';

const STORAGE_KEY = STORAGE_KEYS.AUTH;

interface PersistedAuth {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
  companySlug: string | null;
}

function emptyPersisted(): PersistedAuth {
  return { accessToken: null, refreshToken: null, expiresAt: null, user: null, companySlug: null };
}

function loadPersisted(): PersistedAuth {
  if (typeof localStorage === 'undefined') return emptyPersisted();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyPersisted(), ...(JSON.parse(raw) as Partial<PersistedAuth>) } : emptyPersisted();
  } catch {
    return emptyPersisted();
  }
}

/**
 * Estado de sesión global (equivalente a stores/authStore.ts en React).
 * Persiste tokens/usuario/empresa en localStorage; permisos y restricciones
 * se mantienen solo en memoria y se recargan en cada arranque (ver AuthGuard).
 */
@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly persisted = loadPersisted();

  readonly accessToken = signal<string | null>(this.persisted.accessToken);
  readonly refreshToken = signal<string | null>(this.persisted.refreshToken);
  readonly expiresAt = signal<string | null>(this.persisted.expiresAt);
  readonly user = signal<AuthUser | null>(this.persisted.user);
  readonly companySlug = signal<string | null>(this.persisted.companySlug);

  readonly permissions = signal<string[]>([]);
  readonly allRestrictions = signal<string[]>([]);
  readonly authGrants = signal<string[]>([]);
  readonly rolSistema = signal<string | null>(null);
  readonly roleName = signal<string | null>(null);

  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  setSession(tokens: AuthTokens): void {
    this.accessToken.set(tokens.accessToken);
    this.refreshToken.set(tokens.refreshToken);
    this.expiresAt.set(tokens.expiresAt);
    this.persist();
  }

  setUser(user: AuthUser): void {
    this.user.set(user);
    this.allRestrictions.set(user.allRestrictions ?? []);
    this.authGrants.set(user.authGrants ?? []);
    this.rolSistema.set(user.rolSistema ?? null);
    this.roleName.set(user.roleName ?? null);
    this.persist();
  }

  setPermissions(permissions: string[]): void {
    this.permissions.set(permissions);
  }

  setCompanySlug(slug: string | null): void {
    this.companySlug.set(slug);
    this.persist();
  }

  clear(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.expiresAt.set(null);
    this.user.set(null);
    this.companySlug.set(null);
    this.permissions.set([]);
    this.allRestrictions.set([]);
    this.authGrants.set([]);
    this.rolSistema.set(null);
    this.roleName.set(null);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const data: PersistedAuth = {
      accessToken: this.accessToken(),
      refreshToken: this.refreshToken(),
      expiresAt: this.expiresAt(),
      user: this.user(),
      companySlug: this.companySlug(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
