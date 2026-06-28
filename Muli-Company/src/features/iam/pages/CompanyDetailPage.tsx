import { useParams, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, ShieldCheck, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api'
import { useCompany, useCompanyModules, useGrantModules, useRevokeModules } from '../queries/useCompanies'
import { useAuthStore } from '@/stores/authStore'
import { Can } from '@/features/auth/components/Can'

export default function CompanyDetailPage() {
  const { companyId } = useParams({ strict: false }) as { companyId: string }
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: company, isLoading: loadingCompany } = useCompany(companyId)
  const { data: modules, isLoading: loadingModules } = useCompanyModules(companyId)
  const grantModules = useGrantModules()
  const revokeModules = useRevokeModules()

  const handleToggleModule = (moduleId: string, isGranted: boolean) => {
    if (isGranted) {
      revokeModules.mutate(
        { companyId, moduleIds: [moduleId] },
        {
          onSuccess: () => toast.success('M\u00f3dulo revocado'),
          onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Error al revocar m\u00f3dulo'),
        },
      )
    } else {
      grantModules.mutate(
        { companyId, moduleIds: [moduleId], grantedBy: user?.id ?? '' },
        {
          onSuccess: () => toast.success('M\u00f3dulo concedido'),
          onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Error al conceder m\u00f3dulo'),
        },
      )
    }
  }

  if (loadingCompany) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Empresa no encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/iam/companies' } as any)}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/iam/companies' } as any)}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <Badge variant={company.status === 1 ? 'default' : 'secondary'}>
              {company.status === 1 ? 'Activa' : 'Suspendida'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{company.slug}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informaci&oacute;n general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">RUC</span>
              <span>{company.taxId ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Raz&oacute;n social</span>
              <span>{company.legalName ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{company.email ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moneda</span>
              <span>{company.settlementCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo contribuyente</span>
              <span>{company.taxpayerType === 1 ? 'Natural' : 'Jur\u00eddico'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creada</span>
              <span>{new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direcci&oacute;n</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Direcci&oacute;n fiscal</span>
              <span className="text-right">{company.taxAddress ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Direcci&oacute;n</span>
              <span className="text-right">{company.address ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tel&eacute;fono</span>
              <span>{company.phone ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Web</span>
              <span>{company.website ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actividad econ&oacute;mica</span>
              <span className="text-right">{company.economicActivity ?? '\u2014'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>M&oacute;dulos del sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingModules ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : modules ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">M&oacute;dulos concedidos</h3>
                {modules.grantedModules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ning&uacute;n m&oacute;dulo concedido.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modules.grantedModules.map((mod) => (
                      <Badge key={mod.id} variant="default" className="gap-1 pr-1">
                        <ShieldCheck className="size-3" />
                        {mod.name}
                        <Can permission="iam.companies.manage_modules">
                          <button
                            className="ml-1 hover:text-destructive transition-colors"
                            onClick={() => handleToggleModule(mod.id, true)}
                            disabled={revokeModules.isPending}
                          >
                            &times;
                          </button>
                        </Can>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">M&oacute;dulos disponibles</h3>
                {modules.availableModules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay m&aacute;s m&oacute;dulos disponibles.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modules.availableModules.map((mod) => (
                      <Badge key={mod.id} variant="outline" className="gap-1">
                        <ShieldX className="size-3" />
                        {mod.name}
                        <Can permission="iam.companies.manage_modules">
                          <button
                            className="ml-1 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => handleToggleModule(mod.id, false)}
                            disabled={grantModules.isPending}
                          >
                            +
                          </button>
                        </Can>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Error al cargar m&oacute;dulos.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate({ to: '/iam/companies' } as any)}>
          Volver a empresas
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: `/iam/companies/${companyId}/users` } as any)}>
          Ver usuarios
        </Button>
      </div>
    </div>
  )
}
