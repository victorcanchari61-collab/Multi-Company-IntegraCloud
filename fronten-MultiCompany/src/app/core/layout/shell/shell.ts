import { Component, type Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  LucideBadgeCheck,
  LucideClipboardList,
  LucideHandshake,
  LucideIdCard,
  LucideLayoutGrid,
  LucideLogOut,
  LucideNetwork,
  LucidePanelLeftClose,
  LucidePanelLeftOpen,
  LucideRecycle,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideTruck,
  LucideWarehouse,
  LucideWrench,
} from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ModuleSidebar } from '@/app/core/layout/module-sidebar/module-sidebar';
import { SYSTEMS } from '@/app/core/constants/systems';
import { MenuService } from '@/app/core/services/menu.service';
import { AuthState } from '@/app/core/state/auth.state';
import { SidebarState } from '@/app/core/state/sidebar.state';
import { AuthService } from '@/app/features/iam/auth/services/auth.service';

// Primer segmento de ruta → código de sistema (para saber qué sidebar mostrar).
const ROUTE_SYSTEM_MAP: Record<string, string> = {
  iam: 'IAM',
  erp: 'ERP',
  wms: 'WMS',
  pos: 'POS',
  rrhh: 'RRHH',
};

function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function systemCodeFromUrl(url: string): string | null {
  const firstSegment = url.split('?')[0].split('/').filter(Boolean)[0];
  return firstSegment ? (ROUTE_SYSTEM_MAP[firstSegment] ?? null) : null;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ModuleSidebar,
    LucideLogOut,
    LucidePanelLeftClose,
    LucidePanelLeftOpen,
    LucideShieldCheck,
    LucideLayoutGrid,
    LucideHandshake,
    LucideWarehouse,
    LucideNetwork,
    LucideClipboardList,
    LucideTruck,
    LucideIdCard,
    LucideShoppingCart,
    LucideRecycle,
    LucideBadgeCheck,
    LucideWrench,
  ],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly authState = inject(AuthState);
  protected readonly sidebarState = inject(SidebarState);
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly router = inject(Router);

  protected readonly initials = initials;
  protected readonly systems = SYSTEMS;
  protected readonly systemsMenuOpen = signal(false);

  private readonly currentUrl: Signal<string>;
  protected readonly activeSystemCode = computed(() => systemCodeFromUrl(this.currentUrl()));

  constructor() {
    this.currentUrl = toSignal(
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects),
      ),
      { initialValue: this.router.url },
    );
  }

  protected toggleSystemsMenu(): void {
    this.systemsMenuOpen.update((open) => !open);
  }

  protected closeSystemsMenu(): void {
    this.systemsMenuOpen.set(false);
  }

  protected async logout(): Promise<void> {
    const refreshToken = this.authState.refreshToken();
    try {
      if (refreshToken) await firstValueFrom(this.authService.logout(refreshToken));
    } finally {
      this.authState.clear();
      this.menuService.invalidate(); // el menú es por usuario: el próximo login debe refetchear
      await this.router.navigateByUrl('/login');
    }
  }
}
