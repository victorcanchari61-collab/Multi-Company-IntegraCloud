import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Hola, {user?.fullName ?? 'usuario'}</h1>
      <p className="text-sm text-muted-foreground">
        Bienvenido a IntegraCloud. Selecciona una opción del menú para comenzar.
      </p>
      <Card className="mt-4 p-6 text-sm text-muted-foreground">
        Tu panel mostrará aquí los indicadores de los sistemas a los que tengas acceso.
      </Card>
    </div>
  )
}
