import { useMemo, useState } from 'react'
import { ShieldCheck, Search, X, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'

import { useAllPermissions } from '../queries/usePermissions'

const ACCENTS: Record<string, string> = {
  companies: 'border-l-blue-500',
  permissions: 'border-l-emerald-500',
  roles: 'border-l-violet-500',
  users: 'border-l-amber-500',
}

const BG_ACCENTS: Record<string, string> = {
  companies: 'bg-blue-50 dark:bg-blue-950/20',
  permissions: 'bg-emerald-50 dark:bg-emerald-950/20',
  roles: 'bg-violet-50 dark:bg-violet-950/20',
  users: 'bg-amber-50 dark:bg-amber-950/20',
}

const DOT_ACCENTS: Record<string, string> = {
  companies: 'bg-blue-500',
  permissions: 'bg-emerald-500',
  roles: 'bg-violet-500',
  users: 'bg-amber-500',
}

function groupKey(key: string): string {
  const parts = key.split('.')
  return parts.length >= 2 ? parts[1] : parts[0] ?? key
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    read: 'Leer',
    create: 'Crear',
    update: 'Actualizar',
    delete: 'Eliminar',
    export: 'Exportar',
    approve: 'Aprobar',
    assign_permissions: 'Asignar permisos',
    assign_roles: 'Asignar roles',
    manage_modules: 'Gestionar módulos',
  }
  return labels[action] ?? action
}

export default function PermissionsPage() {
  const { data: permissions = [], isLoading } = useAllPermissions()
  const [search, setSearch] = useState('')

  const grouped = useMemo(() => {
    const groups: Record<string, typeof permissions> = {}
    for (const p of permissions) {
      const g = groupKey(p.key)
      if (!groups[g]) groups[g] = []
      groups[g].push(p)
    }
    return groups
  }, [permissions])

  const filtered = useMemo(() => {
    if (!search) return grouped
    const q = search.toLowerCase()
    const result: Record<string, typeof permissions> = {}
    for (const [g, perms] of Object.entries(grouped)) {
      const matched = perms.filter(
        (p) =>
          p.key.toLowerCase().includes(q) ||
          actionLabel(p.key.split('.').pop() ?? '').toLowerCase().includes(q),
      )
      if (matched.length > 0) result[g] = matched
    }
    return result
  }, [grouped, search])

  const entries = Object.entries(filtered)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Permisos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de todos los permisos disponibles en la plataforma.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar permisos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch('')}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Lock className="mb-2 size-8" />
          <p className="text-sm">
            {search
              ? 'No hay permisos que coincidan con la búsqueda.'
              : 'No hay permisos disponibles.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([group, perms]) => {
            const accent = ACCENTS[group] ?? 'border-l-slate-500'
            const bgAccent = BG_ACCENTS[group] ?? 'bg-slate-50 dark:bg-slate-950/20'
            const dotAccent = DOT_ACCENTS[group] ?? 'bg-slate-500'
            return (
              <div
                key={group}
                className={`overflow-hidden rounded-lg bg-card ${accent} border-l-4 shadow-sm transition-shadow hover:shadow-md`}
              >
                <div className={`px-4 py-3 ${bgAccent}`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold capitalize">{group}</h3>
                    <span className="ml-auto text-xs text-muted-foreground/60">
                      {perms.length}
                    </span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-1">
                    {perms.map((p) => (
                      <div
                        key={p.key}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                      >
                        <span className={`size-2 shrink-0 rounded-full ${dotAccent}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {actionLabel(p.key.split('.').pop() ?? p.key)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground/60">
                            {p.key}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
