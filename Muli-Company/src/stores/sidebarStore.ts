import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface SidebarState {
  /** Modo icono (contraído) vs completo (desplegado). */
  collapsed: boolean
  /** Oculta por completo el sidebar; se reabre desde el navbar. */
  hidden: boolean
  toggleCollapsed: () => void
  toggleHidden: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      hidden: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      toggleHidden: () => set((s) => ({ hidden: !s.hidden })),
    }),
    { name: STORAGE_KEYS.SIDEBAR },
  ),
)
