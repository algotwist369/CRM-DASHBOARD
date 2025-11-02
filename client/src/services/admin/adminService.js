import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AdminService {
  // Get admin dashboard data
  async getDashboard(page = 1, limit = 5) {
    try {
      const response = await apiClient.get(endpoints.admin.dashboard, {
        params: { recentBusinessesPage: page, recentBusinessesLimit: limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch dashboard data' 
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

  // Get business link
  async getBusinessLink(businessId) {
    try {
      const response = await apiClient.get(endpoints.admin.businessLink(businessId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business link' 
      }
    }
  }

  // Get managers list
  async getManagers(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.managers, { params })
      return { success: true, data: response.data }
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
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager' 
      }
    }
  }

  // Update manager
  async updateManager(managerId, managerData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateManager(managerId), managerData)
      return { success: true, data: response.data }
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
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete manager' 
      }
    }
  }
}

export default new AdminService()