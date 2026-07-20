import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../queries/useNotifications'
import { useNotificationRealtime } from '../queries/useNotifications'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  useNotificationRealtime()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useNotifications(false, page)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <Bell className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
            <p className="text-sm text-muted-foreground">
              {data?.unreadCount ?? 0} sin leer
            </p>
          </div>
        </div>
        {data && data.unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="mr-2 size-4" /> Marcar todo leído
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Cargando notificaciones...
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="mb-3 size-12 opacity-30" />
          <p className="text-sm">No hay notificaciones</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-4 rounded-xl border p-4 transition-colors',
                  !n.isRead && 'border-blue-200 bg-blue-50/30',
                )}
              >
                <div className={cn(
                  'mt-1 size-2 shrink-0 rounded-full',
                  n.isRead ? 'bg-transparent' : 'bg-blue-500',
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString('es-PE', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => markAsRead.mutate(n.id)}
                  >
                    <CheckCheck className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {data.totalCount > data.pageSize && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.items.length < data.pageSize}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
