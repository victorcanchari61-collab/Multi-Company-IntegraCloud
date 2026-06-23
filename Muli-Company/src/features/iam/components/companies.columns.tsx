import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import type { Company } from '../types/iam'
import { StatusBadge } from './StatusBadge'

interface Options {
  pending: boolean
  onToggleStatus: (company: Company) => void
}

export function getCompanyColumns({
  pending,
  onToggleStatus,
}: Options): ColumnDef<Company, unknown>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Empresa',
      meta: { label: 'Empresa', hideOnMobile: true },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'slug',
      accessorKey: 'slug',
      header: 'Slug',
      meta: { label: 'Slug' },
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span>,
    },
    {
      id: 'taxId',
      accessorKey: 'taxId',
      header: 'RUC',
      meta: { label: 'RUC' },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.taxId ?? '—'}</span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Estado',
      meta: { label: 'Estado' },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      enableHiding: false,
      meta: { label: 'Acciones' },
      cell: ({ row }) => {
        const company = row.original
        const active = company.status === ENTITY_STATUS.ACTIVE
        return (
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
        )
      },
    },
  ]
}
