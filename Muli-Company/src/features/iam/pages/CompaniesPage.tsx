import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { ENTITY_STATUS } from '@/lib/constants'
import { Can } from '@/features/auth/components/Can'
import { useCompanies, useSetCompanyStatus } from '../queries/useCompanies'
import { CompanyTable } from '../components/CompanyTable'
import { CompanyFormDialog } from '../components/CompanyFormDialog'
import type { Company } from '../types/iam'

export default function CompaniesPage() {
  const { data, isLoading } = useCompanies({ page: 1, size: 50 })
  const setStatus = useSetCompanyStatus()

  const onToggleStatus = (company: Company) =>
    setStatus.mutate(
      { id: company.id, active: company.status !== ENTITY_STATUS.ACTIVE },
      {
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar'),
      },
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

      <CompanyTable
        data={data?.items ?? []}
        loading={isLoading}
        pending={setStatus.isPending}
        onToggleStatus={onToggleStatus}
      />
    </div>
  )
}
