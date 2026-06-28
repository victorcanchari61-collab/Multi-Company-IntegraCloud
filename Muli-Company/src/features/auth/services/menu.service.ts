import { api } from '@/lib/api'

export interface MenuItem {
  code: string
  label: string
  route: string
}

export interface MenuSection {
  systemCode: string
  systemName: string
  items: MenuItem[]
}

export const getMenu = (): Promise<MenuSection[]> =>
  api.get<MenuSection[]>('/menu')
