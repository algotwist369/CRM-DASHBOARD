import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class AdminService {
  // Get admin dashboard data
  async getDashboard() {
    try {
      const response = await apiClient.get(endpoints.admin.dashboard)
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
      const response = await apiClient.get('/api/admin/managers', { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch managers' 
      }
    }
  }
}

export default new AdminService()