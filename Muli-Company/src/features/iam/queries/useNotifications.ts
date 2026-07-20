import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as notificationsService from '../services/notifications.service'
import { useAuthStore } from '@/stores/authStore'

export function useNotifications(unreadOnly = false, page = 1) {
  return useQuery({
    queryKey: ['notifications', unreadOnly, page],
    queryFn: () => notificationsService.getNotifications(unreadOnly, page),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}

export function useNotificationRealtime() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const qc = useQueryClient()
  const connectionRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const baseUrl = import.meta.env.VITE_API_URL ?? ''
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/hubs/notifications?access_token=' + accessToken

    let reconnectTimer: ReturnType<typeof setTimeout>
    let mounted = true

    function connect() {
      if (!mounted) return

      const ws = new WebSocket(wsUrl)
      connectionRef.current = ws

      ws.onopen = () => {
        const user = useAuthStore.getState().user
        if (user?.id) {
          ws.send(JSON.stringify({ protocol: 'json', version: 1 }))
          ws.send(JSON.stringify({
            type: 1,
            target: 'JoinUserGroup',
            arguments: [user.id],
          }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 1 && msg.target === 'ReceiveNotification') {
            qc.invalidateQueries({ queryKey: ['notifications'] })
            qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
          }
        } catch { }
      }

      ws.onclose = () => {
        connectionRef.current = null
        if (mounted) {
          reconnectTimer = setTimeout(connect, 5000)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      mounted = false
      clearTimeout(reconnectTimer)
      connectionRef.current?.close()
    }
  }, [accessToken, qc])
}
