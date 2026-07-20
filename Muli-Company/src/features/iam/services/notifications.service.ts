import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { NotificationListDto, UnreadCountDto } from '../types/notifications'

function qs(params: Record<string, string | number | boolean>): string {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) s.set(k, String(v))
  return '?' + s.toString()
}

export async function getNotifications(unreadOnly = false, page = 1, pageSize = 20): Promise<NotificationListDto> {
  return api.get<NotificationListDto>(API_ENDPOINTS.notifications + qs({ unreadOnly, page, pageSize }))
}

export async function getUnreadCount(): Promise<UnreadCountDto> {
  return api.get<UnreadCountDto>(API_ENDPOINTS.notificationUnreadCount)
}

export async function markAsRead(notificationId: string): Promise<void> {
  await api.put(API_ENDPOINTS.notificationRead(notificationId))
}

export async function markAllAsRead(): Promise<void> {
  await api.put(API_ENDPOINTS.notificationReadAll)
}
