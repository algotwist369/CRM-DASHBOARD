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

  // Get managers
  async getManagers(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.managers, { params })
      // Backend returns { success: true, data: [...], pagination: {...} }
      // Return it directly to maintain structure
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch managers'
      }
    }
  }

  // Get manager by ID
  async getManager(managerId) {
    try {
      const response = await apiClient.get(endpoints.admin.manager(managerId))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch manager'
      }
    }
  }

  // Create manager
  async createManager(managerData) {
    try {
      const response = await apiClient.post(endpoints.admin.createManager, managerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create manager'
      }
    }
  }

  // Update manager
  async updateManager(managerId, managerData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateManager(managerId), managerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update manager'
      }
    }
  }

  // Delete manager
  async deleteManager(managerId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteManager(managerId))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete manager'
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
