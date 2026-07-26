import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, catchError, shareReplay, throwError } from 'rxjs';
import { environment } from '@/environments/environment';
import { API_ENDPOINTS } from '@/app/core/constants/api-endpoints';
import type { MenuSection } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  // El sidebar se monta de nuevo en cada cambio de sistema (IAM → ERP → ...): sin caché eso
  // dispara un GET /menu por navegación. shareReplay guarda la última respuesta para toda la
  // sesión; invalidate() la borra al cambiar de usuario (login/logout).
  private menu$: Observable<MenuSection[]> | null = null;

  getMenu(): Observable<MenuSection[]> {
    this.menu$ ??= this.http.get<MenuSection[]>(`${environment.apiUrl}${API_ENDPOINTS.MENU}`).pipe(
      // Si falla, se limpia la caché para que el próximo suscriptor reintente (shareReplay
      // sin esto dejaría el error "congelado" y el menú no cargaría nunca más).
      catchError((error) => {
        this.menu$ = null;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.menu$;
  }

  invalidate(): void {
    this.menu$ = null;
  }
}
