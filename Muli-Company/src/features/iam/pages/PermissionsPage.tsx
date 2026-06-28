import { ShieldCheck } from 'lucide-react'
import { useAllPermissions } from '../queries/usePermissions'

function groupKey(key: string): string {
  const parts = key.split('.')
  return parts.length > 2 ? parts.slice(0, 2).join('.') : parts[0] ?? key
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
    manage_modules: 'Gestionar módulos',
  }
  return labels[action] ?? action
}

export default function PermissionsPage() {
  const { data: permissions = [], isLoading } = useAllPermissions()

  const grouped: Record<string, typeof permissions> = {}
  for (const p of permissions) {
    const g = groupKey(p.key)
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(p)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permisos</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de todos los permisos disponibles en la plataforma.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([group, perms]) => (
            <div key={group} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <h3 className="font-semibold">{group}</h3>
              </div>
              <ul className="space-y-1">
                {perms.map(p => (
                  <li key={p.key} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted">
                    <span className="size-1.5 rounded-full bg-primary/60" />
                    <span className="text-muted-foreground">{actionLabel(p.key.split('.').pop() ?? p.key)}</span>
                    <span className="ml-auto text-xs text-muted-foreground/50">{p.key}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
