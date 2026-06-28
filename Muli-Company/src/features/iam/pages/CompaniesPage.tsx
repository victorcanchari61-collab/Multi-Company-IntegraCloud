import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import { DataTable } from '@/components/data-table/DataTable'
import { ApiError } from '@/lib/api'
import { useCompanies, useSetCompanyStatus } from '../queries/useCompanies'
import { getCompanyColumns } from '../components/companies.columns'
import { CompanyFormDialog } from '../components/CompanyFormDialog'
import type { Company } from '../types/iam'

export default function CompaniesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useCompanies({ page: 1, size: 50 })
  const setStatus = useSetCompanyStatus()
  const [editing, setEditing] = useState<Company | null>(null)

  const onToggleStatus = (company: Company) =>
    setStatus.mutate(
      { id: company.id, active: company.status !== ENTITY_STATUS.ACTIVE },
      {
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar'),
      },
    )

  const columns = useMemo(
    () =>
      getCompanyColumns({
        pending: setStatus.isPending,
        onToggleStatus,
        onViewDetail: (company) => navigate({ to: '/iam/companies/$companyId', params: { companyId: company.id } }),
        onEdit: setEditing,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStatus.isPending, navigate],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Administra los tenants de la plataforma y su acceso a los sistemas.
          </p>
        </div>
        <Can permission="iam.companies.create">
          <CompanyFormDialog />
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        getRowId={(c) => c.id}
        mobileTitle={(c) => c.name}
        emptyMessage="No hay empresas registradas."
      />

      {editing && (
        <CompanyFormDialog company={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
