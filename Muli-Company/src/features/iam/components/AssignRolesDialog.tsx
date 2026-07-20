import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { useRoles } from '../queries/useRoles'
import { useAssignRolesToUser } from '../queries/useUsers'
import type { User } from '../types/iam'

interface Props {
  companyId: string
  user: User | null
  onClose: () => void
}

export function AssignRolesDialog({ companyId, user, onClose }: Props) {
  const { data: roles, isLoading } = useRoles(companyId)
  const assign = useAssignRolesToUser(companyId)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (roleId: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(roleId)
      else next.delete(roleId)
      return next
    })

  const onSubmit = () => {
    if (!user) return
    assign.mutate(
      { userId: user.id, roleIds: [...selected] },
      {
        onSuccess: () => {
          toast.success('Roles asignados')
          setSelected(new Set())
          onClose()
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo asignar'),
      },
    )
  }

  return (
    <Dialog open={user !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar roles</DialogTitle>
          <DialogDescription>{user?.fullName}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : roles && roles.length > 0 ? (
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center gap-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selected.has(role.id)}
                  onCheckedChange={(checked) => toggle(role.id, checked === true)}
                />
                <Label htmlFor={`role-${role.id}`} className="font-normal">
                  {role.name}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay roles. Crea roles antes de asignarlos.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={assign.isPending || selected.size === 0}>
            {assign.isPending ? 'Asignando…' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
