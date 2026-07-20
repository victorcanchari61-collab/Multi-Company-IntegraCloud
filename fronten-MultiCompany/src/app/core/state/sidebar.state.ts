import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@/app/core/constants/storage-keys';

interface PersistedSidebar {
  collapsed: boolean;
  hidden: boolean;
}

function loadPersisted(): PersistedSidebar {
  if (typeof localStorage === 'undefined') return { collapsed: false, hidden: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
    return raw ? { collapsed: false, hidden: false, ...(JSON.parse(raw) as Partial<PersistedSidebar>) } : { collapsed: false, hidden: false };
  } catch {
    return { collapsed: false, hidden: false };
  }
}

/** Modo icono (contraído) vs completo (desplegado), y visibilidad del sidebar. Persistido. */
@Injectable({ providedIn: 'root' })
export class SidebarState {
  private readonly persisted = loadPersisted();

  readonly collapsed = signal(this.persisted.collapsed);
  readonly hidden = signal(this.persisted.hidden);

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
    this.persist();
  }

  toggleHidden(): void {
    this.hidden.update((v) => !v);
    this.persist();
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify({ collapsed: this.collapsed(), hidden: this.hidden() }));
  }
}
