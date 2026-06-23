import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import type { User } from '../types/iam'
import { StatusBadge } from './StatusBadge'

interface Props {
  data: User[]
  loading: boolean
  pending: boolean
  onDeactivate: (user: User) => void
  onAssignRoles: (user: User) => void
}

export function UserTable({ data, loading, pending, onDeactivate, onAssignRoles }: Props) {
  if (loading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )

  if (data.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay usuarios en esta empresa.
      </p>
    )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.fullName}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <StatusBadge status={user.status} />
            </TableCell>
            <TableCell className="space-x-2 text-right">
              <Can permission="iam.users.assign_roles">
                <Button variant="outline" size="sm" onClick={() => onAssignRoles(user)}>
                  Roles
                </Button>
              </Can>
              <Can permission="iam.users.update">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending || user.status !== ENTITY_STATUS.ACTIVE}
                  onClick={() => onDeactivate(user)}
                >
                  Desactivar
                </Button>
              </Can>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
