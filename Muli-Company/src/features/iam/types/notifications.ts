export interface NotificationDto {
  id: string
  type: string
  title: string
  message: string
  referenceType: string | null
  referenceId: string | null
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationListDto {
  items: NotificationDto[]
  totalCount: number
  unreadCount: number
  page: number
  pageSize: number
}

export interface UnreadCountDto {
  count: number
}
