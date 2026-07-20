import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '../queries/useNotifications'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function NotificationBell() {
  const { data: unread } = useUnreadCount()
  const [open, setOpen] = useState(false)
  const count = unread?.count ?? 0

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <NotificationPreview />
        </DialogContent>
      </Dialog>
    </>
  )
}

function NotificationPreview() {
  const { data, isLoading } = useNotifications(false, 1)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  return (
    <div className="max-h-96 overflow-y-auto">
      {!data || data.unreadCount > 0 && (
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => markAllAsRead.mutate()}
            className="text-xs text-blue-600 hover:underline"
          >
            Marcar todo leído
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Cargando...</p>
      ) : !data || data.items.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          No hay notificaciones
        </p>
      ) : (
        data.items.slice(0, 5).map((n) => (
          <button
            key={n.id}
            onClick={() => { if (!n.isRead) markAsRead.mutate(n.id) }}
            className={cn(
              'w-full text-left border-b px-3 py-2.5 transition-colors hover:bg-muted/50 last:border-0',
              !n.isRead && 'bg-blue-50/50',
            )}
          >
            <p className="text-sm font-medium">{n.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(n.createdAt).toLocaleString('es-PE')}
            </p>
          </button>
        ))
      )}
    </div>
  )
}
