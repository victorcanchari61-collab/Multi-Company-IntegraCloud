import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye, Pencil, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import type { Company } from '../types/iam'
import { StatusBadge } from './StatusBadge'

interface Options {
  pending: boolean
  onToggleStatus: (company: Company) => void
  onViewDetail: (company: Company) => void
  onEdit: (company: Company) => void
}

export function getCompanyColumns({
  pending,
  onToggleStatus,
  onViewDetail,
  onEdit,
}: Options): ColumnDef<Company, unknown>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Empresa',
      meta: { label: 'Empresa', hideOnMobile: true },
      cell: ({ row }) => (
        <button
          className="font-medium hover:underline text-left"
          onClick={() => onViewDetail(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      id: 'slug',
      accessorKey: 'slug',
      header: 'Slug',
      meta: { label: 'Slug' },
      cell: ({ row }) => <span>{row.original.slug}</span>,
    },
    {
      id: 'taxId',
      accessorKey: 'taxId',
      header: 'RUC',
      meta: { label: 'RUC' },
      cell: ({ row }) =>
        row.original.taxId ? (
          <span>{row.original.taxId}</span>
        ) : (
          <span className="text-muted-foreground">{'\u2014'}</span>
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
          <div className="flex justify-end gap-1">
            <Can permission="iam.companies.view">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Ver detalle"
                onClick={() => onViewDetail(company)}
              >
                <Eye className="text-primary" />
                <span className="sr-only">Ver detalle</span>
              </Button>
            </Can>
            <Can permission="iam.companies.update">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Editar"
                onClick={() => onEdit(company)}
              >
                <Pencil className="text-foreground" />
                <span className="sr-only">Editar</span>
              </Button>
            </Can>
            <Can permission="iam.companies.update">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                title={active ? 'Suspender' : 'Activar'}
                onClick={() => onToggleStatus(company)}
              >
                {active ? (
                  <Ban className="text-destructive" />
                ) : (
                  <Power className="text-success" />
                )}
                <span className="sr-only">{active ? 'Suspender' : 'Activar'}</span>
              </Button>
            </Can>
          </div>
        )
      },
    },
  ]
}
