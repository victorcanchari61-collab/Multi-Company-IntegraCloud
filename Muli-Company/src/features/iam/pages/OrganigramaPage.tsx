import { Plus, AlertCircle, EyeOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useActiveCompanyId } from '../hooks/useActiveCompanyId'
import { useRoleTree } from '../queries/useRoles'
import { OrgChart } from '../components/OrgChart'
import { OrgLegend } from '../components/OrgLegend'

export default function OrganigramaPage() {
  const companyId = useActiveCompanyId()
  const { data: roles = [], isLoading } = useRoleTree(companyId ?? '')

  if (!companyId) return (
    <p className="py-12 text-center text-sm text-muted-foreground">
      Selecciona una empresa para gestionar el organigrama.
    </p>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="size-3 rounded-full bg-amber-500" />
          <h1 className="text-xl font-bold tracking-wider text-blue-900">
            ORGANIGRAMA EMPRESARIAL
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-300 text-gray-600">
            <EyeOff className="mr-2 size-4" /> Ocultos
          </Button>
          <Button className="bg-amber-500 text-white hover:bg-amber-600">
            <Plus className="mr-2 size-4" /> Nuevo Rol
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 py-2 text-xs text-amber-700">
        <GripVertical className="size-3.5" />
        HAZ CLIC PARA EDITAR · ARRASTRA PARA MOVER
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="mr-2 size-5 animate-pulse" />
          Cargando organigrama...
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No hay roles configurados.</p>
          <Button variant="outline" className="mt-4">
            <Plus className="mr-2 size-4" /> Crear primer rol
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border bg-white p-6">
            <OrgChart roles={roles} />
          </div>
          <div className="flex justify-start">
            <OrgLegend />
          </div>
        </>
      )}
    </div>
  )
}
