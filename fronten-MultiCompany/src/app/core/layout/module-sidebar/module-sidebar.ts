import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideChevronDown, LucideChevronsLeft, LucideChevronsRight } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { PermissionsService } from '@/app/core/auth/permissions.service';
import type { MenuModule, MenuSection } from '@/app/core/models/menu.model';
import { MenuService } from '@/app/core/services/menu.service';
import { SidebarState } from '@/app/core/state/sidebar.state';
import { SidebarIcon, type SidebarIconKey } from './sidebar-icon';

const SYSTEM_ICON_KEYS: Record<string, SidebarIconKey> = {
  IAM: 'shield-check',
  ERP: 'boxes',
  POS: 'shopping-cart',
  WMS: 'package',
  RRHH: 'user-check',
};

const MODULE_ICON_KEYS: Record<string, SidebarIconKey> = {
  users: 'users',
  roles: 'shield-check',
  permissions: 'key-round',
  organigrama: 'building2',
  companies: 'building2',
};

interface FlyState {
  code: string;
  top: number;
  left: number;
}

// Módulo del menú enriquecido con su ícono ya resuelto: el lookup se hace UNA vez en el
// computed section(), no en cada render del template.
interface SidebarModule extends MenuModule {
  icon: SidebarIconKey;
}

interface SidebarSection extends Omit<MenuSection, 'modules'> {
  modules: SidebarModule[];
}

// Debe coincidir con el breakpoint `md` de Tailwind (768px).
const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Sidebar propio de UN sistema (IAM, ERP, ...), no un árbol cruzado de todos los sistemas.
 * Cada módulo de la app monta el suyo con [systemCode]="'IAM'" (o el que corresponda).
 *
 * Responsive: en desktop (md+) empuja el contenido (ancho w-12/w-52 según collapsed/hidden).
 * En mobile arranca oculto y se abre como drawer flotante sobre el contenido con backdrop,
 * ignorando el modo "collapsed" (en un drawer temporal no tiene sentido el riel de solo iconos).
 */
@Component({
  selector: 'app-module-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SidebarIcon, LucideChevronDown, LucideChevronsLeft, LucideChevronsRight],
  templateUrl: './module-sidebar.html',
  styleUrl: './module-sidebar.css',
  host: {
    class: 'contents',
  },
})
export class ModuleSidebar {
  readonly systemCode = input.required<string>();

  private readonly menuService = inject(MenuService);
  private readonly permissions = inject(PermissionsService);
  protected readonly sidebarState = inject(SidebarState);

  private readonly sections = signal<MenuSection[]>([]);
  private readonly openKeys = signal<Set<string>>(new Set());
  protected readonly fly = signal<FlyState | null>(null);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly isMobile = signal(false);

  constructor() {
    firstValueFrom(this.menuService.getMenu())
      .then((sections) => this.sections.set(sections))
      .catch(() => this.sections.set([]));

    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(MOBILE_QUERY);
      this.isMobile.set(mql.matches);
      const onChange = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
      mql.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', onChange));
    }
  }

  protected readonly systemIcon = computed(() => SYSTEM_ICON_KEYS[this.systemCode()] ?? 'shield-check');

  // Clases como string computado (no [class.w-14]/[class.w-48] sueltos): Tailwind v4 no siempre
  // detecta bien bindings de clase dinámicos armados por Angular, esto es más confiable.
  protected readonly asideClass = computed(() => {
    const hidden = this.sidebarState.hidden();
    const collapsed = this.sidebarState.collapsed();

    const base =
      'fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col overflow-hidden bg-[#0b4c8c] text-slate-100 ' +
      'transition-transform duration-300 ease-in-out ' +
      'md:static md:z-auto md:translate-x-0 md:transition-[width] md:duration-300 md:ease-in-out';

    const mobileTransform = hidden ? '-translate-x-full' : 'translate-x-0';
    const desktopWidth = hidden ? 'md:w-0' : collapsed ? 'md:w-12' : 'md:w-52';

    return `${base} ${mobileTransform} ${desktopWidth}`;
  });

  protected readonly showCollapsedRail = computed(() => this.sidebarState.collapsed() && !this.isMobile());

  protected readonly headerRowClass = computed(() => {
    const base = 'flex h-14 items-center gap-2 border-b border-white/10 px-3.5';
    return this.showCollapsedRail() ? `${base} justify-center px-0` : base;
  });

  protected readonly toggleButtonClass = computed(() => {
    const base =
      'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white';
    return this.showCollapsedRail() ? `${base} justify-center px-0` : base;
  });

  protected readonly section = computed<SidebarSection | null>(() => {
    const raw = this.sections().find((s) => s.systemCode === this.systemCode());
    if (!raw) return null;
    return {
      ...raw,
      modules: raw.modules
        .filter((m) => !m.requiredPermission || this.permissions.can(m.requiredPermission))
        .map((m) => ({
          ...m,
          icon: MODULE_ICON_KEYS[m.code] ?? 'folder',
          submodules: m.submodules.filter((s) => !s.requiredPermission || this.permissions.can(s.requiredPermission)),
        })),
    };
  });

  protected readonly flyModule = computed(() => {
    const f = this.fly();
    return f ? this.section()?.modules.find((m) => m.code === f.code) : undefined;
  });

  protected railButtonClass(moduleCode: string): string {
    const base =
      'flex w-full justify-center rounded-md p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white';
    return this.fly()?.code === moduleCode ? `${base} bg-white/10 text-white` : base;
  }

  protected chevronClass(open: boolean, size: 'sm' | 'xs' = 'sm'): string {
    const base = `${size === 'sm' ? 'size-3' : 'size-2.5'} transition-transform duration-200`;
    return open ? base : `${base} -rotate-90`;
  }

  protected isOpen(key: string): boolean {
    return this.openKeys().has(key);
  }

  protected toggleOpen(key: string): void {
    const next = new Set(this.openKeys());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.openKeys.set(next);
  }

  /** En mobile, navegar cierra el drawer (si no, tapa el contenido después de navegar). */
  protected closeOnMobileNavigate(): void {
    if (this.isMobile() && !this.sidebarState.hidden()) this.sidebarState.toggleHidden();
  }

  protected closeDrawer(): void {
    if (!this.sidebarState.hidden()) this.sidebarState.toggleHidden();
  }

  protected cancelClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  protected scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => this.fly.set(null), 140);
  }

  protected openFly(module: MenuModule, event: MouseEvent): void {
    this.cancelClose();
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.fly.set({ code: module.code, top: rect.top, left: rect.right + 8 });
  }

  protected closeFlyNow(): void {
    this.fly.set(null);
  }
}
