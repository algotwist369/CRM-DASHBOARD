import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class NotificationService {
  // Get all notifications
  async getNotifications(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.NOTIFICATIONS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notifications' 
      }
    }
  }

  // Get single notification
  async getNotification(notificationId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANAGER.NOTIFICATION(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification' 
      }
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANAGER.NOTIFICATIONS, notificationData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create notification' 
      }
    }
  }

  // Update notification
  async updateNotification(notificationId, notificationData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANAGER.NOTIFICATION(notificationId), notificationData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update notification' 
      }
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MANAGER.NOTIFICATION(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete notification' 
      }
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await apiClient.get('/notifications/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification statistics' 
      }
    }
  }

  // Send notification
  async sendNotification(notificationId) {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/send`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send notification' 
      }
    }
  }

  // Schedule notification
  async scheduleNotification(notificationId, scheduledAt) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/schedule`, { scheduledAt })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to schedule notification' 
      }
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark notification as read' 
      }
    }
  }

  // Mark notification as unread
  async markNotificationAsUnread(notificationId) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/unread`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark notification as unread' 
      }
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.post('/notifications/mark-all-read')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark all notifications as read' 
      }
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread-count')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch unread count' 
      }
    }
  }

  // Get recent notifications
  async getRecentNotifications(limit = 10) {
    try {
      const response = await apiClient.get(`/notifications/recent?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch recent notifications' 
      }
    }
  }

  // Get scheduled notifications
  async getScheduledNotifications() {
    try {
      const response = await apiClient.get('/notifications/scheduled')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch scheduled notifications' 
      }
    }
  }

  // Get failed notifications
  async getFailedNotifications() {
    try {
      const response = await apiClient.get('/notifications/failed')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch failed notifications' 
      }
    }
  }

  // Retry failed notification
  async retryFailedNotification(notificationId) {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/retry`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to retry failed notification' 
      }
    }
  }

  // Get notification recipients
  async getNotificationRecipients(notificationId) {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}/recipients`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification recipients' 
      }
    }
  }

  // Add notification recipients
  async addNotificationRecipients(notificationId, recipients) {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/recipients`, { recipients })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add notification recipients' 
      }
    }
  }

  // Remove notification recipients
  async removeNotificationRecipients(notificationId, recipientIds) {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}/recipients`, {
        data: { recipientIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove notification recipients' 
      }
    }
  }

  // Get notification history
  async getNotificationHistory(notificationId) {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}/history`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification history' 
      }
    }
  }

  // Duplicate notification
  async duplicateNotification(notificationId) {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/duplicate`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to duplicate notification' 
      }
    }
  }

  // Export notification data
  async exportNotificationData(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/notifications/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export notification data' 
      }
    }
  }

  // Bulk update notifications
  async bulkUpdateNotifications(notificationIds, updateData) {
    try {
      const response = await apiClient.patch('/notifications/bulk-update', {
        notificationIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update notifications' 
      }
    }
  }

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds) {
    try {
      const response = await apiClient.delete('/notifications/bulk-delete', {
        data: { notificationIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete notifications' 
      }
    }
  }
}

export default new NotificationService()
