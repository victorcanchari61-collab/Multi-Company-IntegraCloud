import { useSearch } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'

export function useActiveCompanyId(): string | null {
  const search = useSearch({ strict: false }) as { companyId?: string }
  if (search.companyId) return search.companyId
  return useAuthStore((s) => s.user?.companyId ?? null)
}
