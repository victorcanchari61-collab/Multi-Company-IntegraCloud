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
import type { Company } from '../types/iam'
import { StatusBadge } from './StatusBadge'

interface Props {
  data: Company[]
  loading: boolean
  pending: boolean
  onToggleStatus: (company: Company) => void
}

export function CompanyTable({ data, loading, pending, onToggleStatus }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay empresas registradas.
      </p>
    )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>RUC</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((company) => {
          const active = company.status === ENTITY_STATUS.ACTIVE
          return (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-muted-foreground">{company.slug}</TableCell>
              <TableCell className="text-muted-foreground">
                {company.taxId ?? '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={company.status} />
              </TableCell>
              <TableCell className="text-right">
                <Can permission="iam.companies.update">
                  <Button
                    variant={active ? 'ghost' : 'outline'}
                    size="sm"
                    disabled={pending}
                    onClick={() => onToggleStatus(company)}
                  >
                    {active ? 'Suspender' : 'Activar'}
                  </Button>
                </Can>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
