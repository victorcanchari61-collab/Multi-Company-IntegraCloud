import { api } from '@/lib/api'

export interface MenuItem {
  code: string
  label: string
  route: string
}

export interface MenuModule {
  code: string
  label: string
  /** Si tiene valor (y submodules vacío) es un módulo-hoja (link directo). */
  route: string | null
  submodules: MenuItem[]
}

export interface MenuSection {
  systemCode: string
  systemName: string
  modules: MenuModule[]
}

export const getMenu = (): Promise<MenuSection[]> =>
  api.get<MenuSection[]>('/menu')
