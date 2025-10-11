import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getNotificationState = (state) => state.notification

// Notification selectors
export const selectNotifications = createSelector(
  [getNotificationState],
  (notification) => notification.notifications
)

export const selectNotificationsList = createSelector(
  [selectNotifications],
  (notifications) => notifications.list
)

export const selectCurrentNotification = createSelector(
  [selectNotifications],
  (notifications) => notifications.current
)

export const selectNotificationsLoading = createSelector(
  [selectNotifications],
  (notifications) => notifications.isLoading
)

export const selectNotificationsError = createSelector(
  [selectNotifications],
  (notifications) => notifications.error
)

export const selectNotificationsPagination = createSelector(
  [selectNotifications],
  (notifications) => notifications.pagination
)

// Unread count selectors
export const selectUnreadCount = createSelector(
  [getNotificationState],
  (notification) => notification.unreadCount
)

export const selectUnreadCountData = createSelector(
  [selectUnreadCount],
  (unreadCount) => unreadCount.count
)

export const selectUnreadCountLoading = createSelector(
  [selectUnreadCount],
  (unreadCount) => unreadCount.isLoading
)

export const selectUnreadCountError = createSelector(
  [selectUnreadCount],
  (unreadCount) => unreadCount.error
)

// Stats selectors
export const selectNotificationStats = createSelector(
  [getNotificationState],
  (notification) => notification.stats
)

export const selectNotificationStatsData = createSelector(
  [selectNotificationStats],
  (stats) => stats.data
)

export const selectNotificationStatsLoading = createSelector(
  [selectNotificationStats],
  (stats) => stats.isLoading
)

export const selectNotificationStatsError = createSelector(
  [selectNotificationStats],
  (stats) => stats.error
)

// Notification filtering selectors
export const selectNotificationById = createSelector(
  [selectNotificationsList],
  (notifications) => (id) => notifications.find(notification => notification.id === id)
)

export const selectNotificationsByType = createSelector(
  [selectNotificationsList],
  (notifications) => (type) => notifications.filter(notification => notification.type === type)
)

export const selectNotificationsByStatus = createSelector(
  [selectNotificationsList],
  (notifications) => (status) => notifications.filter(notification => notification.status === status)
)

export const selectNotificationsByPriority = createSelector(
  [selectNotificationsList],
  (notifications) => (priority) => notifications.filter(notification => notification.priority === priority)
)

export const selectNotificationsByDate = createSelector(
  [selectNotificationsList],
  (notifications) => (date) => notifications.filter(notification => 
    new Date(notification.date).toDateString() === new Date(date).toDateString()
  )
)

// Status-based selectors
export const selectUnreadNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => !notification.isRead)
)

export const selectReadNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.isRead)
)

export const selectSentNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.status === 'sent')
)

export const selectPendingNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.status === 'pending')
)

export const selectFailedNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.status === 'failed')
)

export const selectScheduledNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.status === 'scheduled')
)

// Priority-based selectors
export const selectHighPriorityNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.priority === 'high')
)

export const selectMediumPriorityNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.priority === 'medium')
)

export const selectLowPriorityNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.priority === 'low')
)

// Type-based selectors
export const selectEmailNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.type === 'email')
)

export const selectSMSNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.type === 'sms')
)

export const selectPushNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.type === 'push')
)

export const selectInAppNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.filter(notification => notification.type === 'in_app')
)

// Recent notifications
export const selectRecentNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => (limit = 5) => {
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// Today's notifications
export const selectTodayNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => {
    const today = new Date().toDateString()
    return notifications.filter(notification => 
      new Date(notification.date).toDateString() === today
    )
  }
)

// Search selectors
export const selectNotificationsBySearch = createSelector(
  [selectNotificationsList],
  (notifications) => (searchTerm) => {
    if (!searchTerm) return notifications
    const term = searchTerm.toLowerCase()
    return notifications.filter(notification => 
      notification.title?.toLowerCase().includes(term) ||
      notification.message?.toLowerCase().includes(term) ||
      notification.type?.toLowerCase().includes(term) ||
      notification.priority?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalNotifications = createSelector(
  [selectNotificationsList],
  (notifications) => notifications.length
)

export const selectNotificationsCountByType = createSelector(
  [selectNotificationsList],
  (notifications) => {
    return notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1
      return acc
    }, {})
  }
)

export const selectNotificationsCountByStatus = createSelector(
  [selectNotificationsList],
  (notifications) => {
    return notifications.reduce((acc, notification) => {
      acc[notification.status] = (acc[notification.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectNotificationsCountByPriority = createSelector(
  [selectNotificationsList],
  (notifications) => {
    return notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1
      return acc
    }, {})
  }
)

export const selectNotificationsCountByDate = createSelector(
  [selectNotificationsList],
  (notifications) => {
    return notifications.reduce((acc, notification) => {
      const date = new Date(notification.date).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  }
)

// Notification details selectors
export const selectNotificationTitle = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.title
)

export const selectNotificationMessage = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.message
)

export const selectNotificationType = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.type
)

export const selectNotificationPriority = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.priority
)

export const selectNotificationStatus = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.status
)

export const selectNotificationIsRead = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.isRead
)

export const selectNotificationDate = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.date
)

export const selectNotificationCreatedAt = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.createdAt
)

export const selectNotificationUpdatedAt = createSelector(
  [selectCurrentNotification],
  (notification) => notification?.updatedAt
)

// Loading states
export const selectNotificationLoading = createSelector(
  [selectNotificationsLoading, selectUnreadCountLoading, selectNotificationStatsLoading],
  (notificationsLoading, unreadCountLoading, statsLoading) => 
    notificationsLoading || unreadCountLoading || statsLoading
)

// Error states
export const selectNotificationError = createSelector(
  [selectNotificationsError, selectUnreadCountError, selectNotificationStatsError],
  (notificationsError, unreadCountError, statsError) => 
    notificationsError || unreadCountError || statsError
)

// Combined selectors
export const selectNotificationState = createSelector(
  [selectNotifications, selectUnreadCount, selectNotificationStats],
  (notifications, unreadCount, stats) => ({
    notifications,
    unreadCount,
    stats
  })
)

export const selectNotificationOverview = createSelector(
  [selectTotalNotifications, selectUnreadNotifications, selectReadNotifications, selectSentNotifications, selectPendingNotifications, selectFailedNotifications, selectNotificationsCountByType, selectNotificationsCountByStatus, selectNotificationsCountByPriority],
  (totalNotifications, unreadNotifications, readNotifications, sentNotifications, pendingNotifications, failedNotifications, countByType, countByStatus, countByPriority) => ({
    totalNotifications,
    unreadNotifications: unreadNotifications.length,
    readNotifications: readNotifications.length,
    sentNotifications: sentNotifications.length,
    pendingNotifications: pendingNotifications.length,
    failedNotifications: failedNotifications.length,
    countByType,
    countByStatus,
    countByPriority
  })
)
