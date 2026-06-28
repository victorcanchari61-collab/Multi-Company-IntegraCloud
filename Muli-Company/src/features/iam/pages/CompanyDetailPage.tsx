import { useParams, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api'
import {
  useCompany,
  useCompanyAccess,
  useGrantModules,
  useGrantSystems,
  useRevokeModules,
  useRevokeSystem,
} from '../queries/useCompanies'
import { useAuthStore } from '@/stores/authStore'
import { Can } from '@/features/auth/components/Can'
import type { ModuleAccess, SystemAccess } from '../types/iam'

export default function CompanyDetailPage() {
  const { companyId } = useParams({ strict: false }) as { companyId: string }
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: company, isLoading: loadingCompany } = useCompany(companyId)
  const { data: access, isLoading: loadingAccess } = useCompanyAccess(companyId)

  const grantSystems = useGrantSystems()
  const revokeSystem = useRevokeSystem()
  const grantModules = useGrantModules()
  const revokeModules = useRevokeModules()

  const busy =
    grantSystems.isPending ||
    revokeSystem.isPending ||
    grantModules.isPending ||
    revokeModules.isPending

  const onError = (error: unknown) =>
    toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar el acceso')

  const toggleSystem = (sys: SystemAccess) => {
    if (sys.granted) {
      revokeSystem.mutate(
        { companyId, systemId: sys.systemId },
        { onSuccess: () => toast.success(`Sistema "${sys.name}" revocado`), onError },
      )
    } else {
      grantSystems.mutate(
        { companyId, systemIds: [sys.systemId], grantedBy: user?.id ?? '' },
        { onSuccess: () => toast.success(`Sistema "${sys.name}" concedido`), onError },
      )
    }
  }

  const toggleModule = (mod: ModuleAccess) => {
    if (mod.granted) {
      revokeModules.mutate({ companyId, moduleIds: [mod.moduleId] }, { onError })
    } else {
      grantModules.mutate(
        { companyId, moduleIds: [mod.moduleId], grantedBy: user?.id ?? '' },
        { onError },
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
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="RUC" value={company.taxId} />
            <Row label="Razón social" value={company.legalName} />
            <Row label="Email" value={company.email} />
            <Row label="Moneda" value={company.settlementCurrency} />
            <Row label="Tipo contribuyente" value={company.taxpayerType === 1 ? 'Natural' : 'Jurídico'} />
            <Row label="Creada" value={new Date(company.createdAt).toLocaleDateString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Dirección fiscal" value={company.taxAddress} />
            <Row label="Dirección" value={company.address} />
            <Row label="Teléfono" value={company.phone} />
            <Row label="Web" value={company.website} />
            <Row label="Actividad económica" value={company.economicActivity} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistemas y módulos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Concede a la empresa los sistemas y, dentro de cada uno, sus módulos.
          </p>
        </CardHeader>
        <CardContent>
          {loadingAccess ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !access || access.systems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay sistemas para licenciar.</p>
          ) : (
            <div className="space-y-3">
              {access.systems.map((sys) => (
                <div key={sys.systemId} className="overflow-hidden rounded-lg border">
                  <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sys.name}</span>
                      {sys.isBase ? (
                        <Badge variant="secondary">Base · siempre activo</Badge>
                      ) : (
                        <Badge
                          className={cn(
                            'border-transparent',
                            sys.granted
                              ? 'bg-success text-success-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {sys.granted ? 'Concedido' : 'No concedido'}
                        </Badge>
                      )}
                    </div>
                    {!sys.isBase && (
                      <Can permission="iam.companies.manage_modules">
                        <Button
                          size="sm"
                          variant={sys.granted ? 'outline' : 'default'}
                          disabled={busy}
                          onClick={() => toggleSystem(sys)}
                        >
                          {sys.granted ? 'Quitar sistema' : 'Conceder sistema'}
                        </Button>
                      </Can>
                    )}
                  </div>

                  {sys.granted && (
                    <div className="border-t bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Módulos
                      </p>
                      {sys.modules.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Este sistema aún no tiene módulos en el catálogo.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {sys.modules.map((mod) =>
                            sys.isBase ? (
                              <Badge key={mod.moduleId} variant="default" className="gap-1">
                                <Check className="size-3" />
                                {mod.name}
                              </Badge>
                            ) : (
                              <Can
                                key={mod.moduleId}
                                permission="iam.companies.manage_modules"
                                fallback={
                                  <Badge variant={mod.granted ? 'default' : 'outline'}>{mod.name}</Badge>
                                }
                              >
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => toggleModule(mod)}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                                    mod.granted
                                      ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
                                      : 'border-border bg-background text-foreground hover:bg-muted',
                                  )}
                                >
                                  {mod.granted ? (
                                    <Check className="size-3" />
                                  ) : (
                                    <Plus className="size-3" />
                                  )}
                                  {mod.name}
                                </button>
                              </Can>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate({ to: '/iam/companies' } as any)}>
          Volver a empresas
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? '—'}</span>
    </div>
  )
}
