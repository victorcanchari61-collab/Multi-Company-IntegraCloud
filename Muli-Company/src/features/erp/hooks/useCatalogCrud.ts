import { useMemo, useState } from 'react'

interface NamedEntity {
  id: string
  name: string
  isActive: boolean
}

/**
 * LÓGICA separada de la UI: estado de búsqueda, fila en edición, filtrado y
 * métricas. Reutilizable por cualquier catálogo simple (categorías, marcas…).
 * Los datos (query) y las mutaciones se inyectan desde la sección; este hook
 * solo concentra el estado/derivados de la vista.
 */
export function useCatalogCrud<T extends NamedEntity>(items: T[] | undefined) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<T | null>(null)

  const filtered = useMemo(() => {
    const list = items ?? []
    const q = search.trim().toLowerCase()
    return q ? list.filter((i) => i.name.toLowerCase().includes(q)) : list
  }, [items, search])

  const stats = useMemo(() => {
    const list = items ?? []
    return {
      total: list.length,
      active: list.filter((i) => i.isActive).length,
      inactive: list.filter((i) => !i.isActive).length,
    }
  }, [items])

  return { search, setSearch, editing, setEditing, filtered, stats }
}
