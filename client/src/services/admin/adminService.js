import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AdminService {
  // Get admin dashboard
  async getDashboard(page = 1, limit = 5) {
    try {
      const response = await apiClient.get(endpoints.admin.dashboard, {
        params: { page, limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard'
      }
    }
  }

  // Create manager
  async createManager(managerData) {
    try {
      const response = await apiClient.post(endpoints.admin.createManager, managerData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create manager'
      }
    }
  }

  // Get daily business records (Admin access)
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

  // Get daily summary (Admin access)
  async getDailySummary(params = {}) {
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

  // Get business analytics (Admin access)
  async getBusinessAnalytics(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.getAnalytics, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business analytics' 
      }
    }
  }
}

export default new AdminService()
