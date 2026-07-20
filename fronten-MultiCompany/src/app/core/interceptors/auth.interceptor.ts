import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import { ApiError } from '@/app/core/http/api-error';
import { AuthState } from '@/app/core/state/auth.state';
import type { AuthTokens } from '@/app/features/iam/auth/models/auth.model';

// Refresh en un solo vuelo: varias requests que reciben 401 a la vez
// comparten el mismo intento de refresh (usa fetch crudo para no re-entrar al interceptor).
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(authState: AuthState): Promise<boolean> {
  const refreshToken = authState.refreshToken();
  if (!refreshToken) {
    authState.clear();
    return false;
  }

  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        authState.clear();
        return false;
      }
      authState.setSession((await res.json()) as AuthTokens);
      return true;
    } catch {
      authState.clear();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function toApiError(error: unknown): ApiError | unknown {
  if (!(error instanceof HttpErrorResponse)) return error;
  const body = error.error as { code?: string; message?: string } | null;
  return new ApiError(error.status, body?.code ?? 'unknown_error', body?.message ?? error.statusText);
}

/** Inyecta el Bearer token y reintenta una vez con refresh si la API responde 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);
  const accessToken = authState.accessToken();
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && authState.refreshToken()) {
        return from(refreshSession(authState)).pipe(
          switchMap((refreshed) => {
            if (!refreshed) return throwError(() => toApiError(error));
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${authState.accessToken()}` },
            });
            return next(retryReq).pipe(catchError((retryError: unknown) => throwError(() => toApiError(retryError))));
          }),
        );
      }
      return throwError(() => toApiError(error));
    }),
  );
};
