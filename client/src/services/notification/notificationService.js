import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class NotificationService {
  // Create notification
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post(endpoints.notifications.create, notificationData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create notification' 
      }
    }
  }

  // Send notification
  async sendNotification(notificationId) {
    try {
      const response = await apiClient.post(endpoints.notifications.send(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send notification' 
      }
    }
  }

  // Get notifications
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get(endpoints.notifications.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notifications' 
      }
    }
  }

  // Get notification analytics
  async getNotificationAnalytics(notificationId) {
    try {
      const response = await apiClient.get(endpoints.notifications.getAnalytics(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification analytics' 
      }
    }
  }

  // Create campaign
  async createCampaign(campaignData) {
    try {
      const response = await apiClient.post(endpoints.notifications.createCampaign, campaignData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create campaign' 
      }
    }
  }

  // Get campaigns
  async getCampaigns(params = {}) {
    try {
      const response = await apiClient.get(endpoints.notifications.getCampaigns, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch campaigns' 
      }
    }
  }

  // Get customer analytics
  async getCustomerAnalytics() {
    try {
      const response = await apiClient.get(endpoints.notifications.getCustomerAnalytics)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer analytics' 
      }
    }
  }
}

export default new NotificationService()
