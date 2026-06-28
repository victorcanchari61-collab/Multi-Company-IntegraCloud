import { useQuery } from '@tanstack/react-query'
import { getMenu, type MenuSection } from '../services/menu.service'

export function useMenu() {
  return useQuery<MenuSection[]>({
    queryKey: ['menu'],
    queryFn: getMenu,
    staleTime: 5 * 60 * 1000,
  })
}
