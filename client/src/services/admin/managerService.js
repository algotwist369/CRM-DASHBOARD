import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class ManagerService {
  // Get all managers
  async getManagers(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.ADMIN.MANAGERS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch managers' 
      }
    }
  }

  // Get single manager
  async getManager(managerId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.MANAGER(managerId))
      return { success: true, data: response.data }
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
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.MANAGERS, managerData)
      return { success: true, data: response.data }
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
      const response = await apiClient.put(API_ENDPOINTS.ADMIN.MANAGER(managerId), managerData)
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
      const response = await apiClient.delete(API_ENDPOINTS.ADMIN.MANAGER(managerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete manager' 
      }
    }
  }

  // Get manager statistics
  async getManagerStats(managerId) {
    try {
      const response = await apiClient.get(`/managers/${managerId}/stats`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager statistics' 
      }
    }
  }

  // Get manager's business
  async getManagerBusiness(managerId) {
    try {
      const response = await apiClient.get(`/managers/${managerId}/business`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager business' 
      }
    }
  }

  // Get manager's staff
  async getManagerStaff(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/staff`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager staff' 
      }
    }
  }

  // Get manager's customers
  async getManagerCustomers(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/customers`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager customers' 
      }
    }
  }

  // Get manager's appointments
  async getManagerAppointments(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/appointments`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager appointments' 
      }
    }
  }

  // Get manager's transactions
  async getManagerTransactions(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/transactions`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager transactions' 
      }
    }
  }

  // Get manager's performance
  async getManagerPerformance(managerId, period = '30d') {
    try {
      const response = await apiClient.get(`/managers/${managerId}/performance?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager performance' 
      }
    }
  }

  // Update manager status
  async updateManagerStatus(managerId, status) {
    try {
      const response = await apiClient.patch(`/managers/${managerId}/status`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update manager status' 
      }
    }
  }

  // Update manager permissions
  async updateManagerPermissions(managerId, permissions) {
    try {
      const response = await apiClient.patch(`/managers/${managerId}/permissions`, { permissions })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update manager permissions' 
      }
    }
  }

  // Assign business to manager
  async assignBusinessToManager(managerId, businessId) {
    try {
      const response = await apiClient.patch(`/managers/${managerId}/assign-business`, { businessId })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to assign business to manager' 
      }
    }
  }

  // Remove business from manager
  async removeBusinessFromManager(managerId, businessId) {
    try {
      const response = await apiClient.patch(`/managers/${managerId}/remove-business`, { businessId })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove business from manager' 
      }
    }
  }

  // Get manager's activity logs
  async getManagerActivityLogs(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/activity-logs`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager activity logs' 
      }
    }
  }

  // Get manager's notifications
  async getManagerNotifications(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/notifications`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager notifications' 
      }
    }
  }

  // Send notification to manager
  async sendNotificationToManager(managerId, notificationData) {
    try {
      const response = await apiClient.post(`/managers/${managerId}/send-notification`, notificationData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send notification to manager' 
      }
    }
  }

  // Get manager's reports
  async getManagerReports(managerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/managers/${managerId}/reports`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch manager reports' 
      }
    }
  }

  // Export manager data
  async exportManagerData(managerId, format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint(`/managers/${managerId}/export`, params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export manager data' 
      }
    }
  }

  // Bulk update managers
  async bulkUpdateManagers(managerIds, updateData) {
    try {
      const response = await apiClient.patch('/managers/bulk-update', {
        managerIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update managers' 
      }
    }
  }

  // Bulk delete managers
  async bulkDeleteManagers(managerIds) {
    try {
      const response = await apiClient.delete('/managers/bulk-delete', {
        data: { managerIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete managers' 
      }
    }
  }
}

export default new ManagerService()
