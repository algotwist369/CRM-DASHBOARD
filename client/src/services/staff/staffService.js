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

  // Transactions
  async createTransaction(payload) {
    try {
      const response = await apiClient.post(endpoints.staff.transactions, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add transaction'
      }
    }
  }

  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get(endpoints.staff.transactions, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch transactions'
      }
    }
  }

  async getTransactionById(id) {
    try {
      const response = await apiClient.get(endpoints.staff.transaction(id))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch transaction'
      }
    }
  }

  async updateTransaction(id, payload) {
    try {
      const response = await apiClient.put(endpoints.staff.transaction(id), payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update transaction'
      }
    }
  }

  async deleteTransaction(id) {
    try {
      const response = await apiClient.delete(endpoints.staff.transaction(id))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete transaction'
      }
    }
  }

  // Daily business - create record
  async createDailyBusiness(payload) {
    try {
      const response = await apiClient.post(endpoints.dailyBusiness.create, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add daily business record'
      }
    }
  }

  // Daily business - fetch summary for a date
  async getDailyBusinessSummary(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.getSummary, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch daily summary'
      }
    }
  }

  // Daily business - fetch records
  async getDailyBusinessRecords(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch daily business records'
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