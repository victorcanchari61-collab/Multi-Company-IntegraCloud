import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/features/auth/components/Can'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useRoles } from '../queries/useRoles'
import { RoleFormDialog } from '../components/RoleFormDialog'

export default function RolesPage() {
  const companyId = useActiveCompanyId()

  if (!companyId)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Selecciona una empresa para administrar sus roles.
      </p>
    )

  return <RolesContent companyId={companyId} />
}

function RolesContent({ companyId }: { companyId: string }) {
  const { data: roles, isLoading } = useRoles(companyId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Roles de tu empresa y los permisos que agrupan.
          </p>
        </div>
        <Can permission="iam.roles.create">
          <RoleFormDialog companyId={companyId} />
        </Can>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : roles && roles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {role.description ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay roles. Crea el primero.
        </p>
      )}
    </div>
  )
}
