import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class StaffService {
  // Get staff profile
  async getProfile() {
    try {
      const response = await apiClient.get(endpoints.staff.profile)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      }
    }
  }

  // Update staff profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(endpoints.staff.updateProfile, profileData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      }
    }
  }

  // Get business information
  async getBusiness() {
    try {
      const response = await apiClient.get(endpoints.staff.business)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business information' 
      }
    }
  }

  // Get staff dashboard
  async getDashboard() {
    try {
      const response = await apiClient.get(endpoints.staff.dashboard)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch dashboard' 
      }
    }
  }

  // Get notifications (prepared for future implementation)
  async getNotifications() {
    try {
      const response = await apiClient.get(endpoints.staff.notifications)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notifications' 
      }
    }
  }

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await apiClient.get(endpoints.staff.unreadCount)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch unread count' 
      }
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      const response = await apiClient.put(endpoints.staff.markNotificationRead(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark notification as read' 
      }
    }
  }
}

export default new StaffService()