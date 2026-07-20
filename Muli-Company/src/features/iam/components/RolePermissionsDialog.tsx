import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError } from '@/lib/api'
import { useAssignPermissionsToRole, useRoleById } from '../queries/useRoles'
import { useAllPermissions } from '../queries/usePermissions'
import type { Role } from '../types/iam'

const ACTION_LABELS: Record<string, string> = {
  read: 'Leer',
  create: 'Crear',
  update: 'Actualizar',
  delete: 'Eliminar',
  export: 'Exportar',
  approve: 'Aprobar',
  view: 'Ver',
  assign_permissions: 'Asignar permisos',
  assign_roles: 'Asignar roles',
  manage_modules: 'Gestionar módulos',
}

const actionLabel = (key: string) => {
  const action = key.split('.').pop() ?? key
  return ACTION_LABELS[action] ?? action
}

const groupKey = (key: string) => key.split('.')[1] ?? key

interface Props {
  companyId: string
  role: Role | null
  onClose: () => void
}

export function RolePermissionsDialog({ companyId, role, onClose }: Props) {
  const open = role !== null
  const { data: roleDetail } = useRoleById(companyId, role?.id ?? '')
  const { data: permissions = [], isLoading } = useAllPermissions()
  const assign = useAssignPermissionsToRole(companyId)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Precarga los permisos actuales del rol.
  useEffect(() => {
    if (roleDetail) setSelected(new Set(roleDetail.permissions.map((p) => p.id)))
  }, [roleDetail])

  const grouped = useMemo(() => {
    const g: Record<string, typeof permissions> = {}
    for (const p of permissions) {
      const key = groupKey(p.key)
      ;(g[key] ??= []).push(p)
    }
    return Object.entries(g)
  }, [permissions])

  // No permitir guardar hasta que carguen los permisos actuales (evita borrarlos por error).
  const ready = roleDetail !== undefined

  const toggle = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })

  const onSave = () => {
    if (!role) return
    assign.mutate(
      { roleId: role.id, permissionIds: [...selected] },
      {
        onSuccess: () => {
          toast.success('Permisos actualizados')
          onClose()
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudieron guardar los permisos'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permisos · {role?.name}</DialogTitle>
          <DialogDescription>
            Marca los permisos de este rol. Los heredan todos sus usuarios.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {isLoading || !ready ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
          ) : grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay permisos disponibles para tu empresa.
            </p>
          ) : (
            grouped.map(([group, perms]) => (
              <div key={group} className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted/40 px-3 py-2 text-sm font-semibold capitalize">
                  {group}
                </div>
                <div className="divide-y">
                  {perms.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={(c) => toggle(p.id, c === true)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{actionLabel(p.key)}</p>
                        <p className="truncate text-xs text-muted-foreground/60">{p.key}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={assign.isPending || !ready}>
            {assign.isPending ? 'Guardando…' : 'Guardar permisos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
