import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class ManagerService {
  // Get manager dashboard data
  async getDashboard() {
    try {
      const response = await apiClient.get(endpoints.manager.dashboard)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch dashboard data' 
      }
    }
  }

  // Get staff list
  async getStaff(params = {}) {
    try {
      const response = await apiClient.get(endpoints.manager.staff, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff' 
      }
    }
  }

  // Add staff member
  async addStaff(staffData) {
    try {
      const response = await apiClient.post(endpoints.manager.addStaff, staffData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add staff member' 
      }
    }
  }

  // Update staff member
  async updateStaff(staffId, staffData) {
    try {
      const response = await apiClient.put(endpoints.manager.updateStaff(staffId), staffData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff member' 
      }
    }
  }

  // Delete staff member
  async deleteStaff(staffId) {
    try {
      const response = await apiClient.delete(endpoints.manager.deleteStaff(staffId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete staff member' 
      }
    }
  }

  // Get transactions
  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get(endpoints.manager.transactions, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions' 
      }
    }
  }

  // Add transaction
  async addTransaction(transactionData) {
    try {
      const response = await apiClient.post(endpoints.manager.addTransaction, transactionData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add transaction' 
      }
    }
  }
}

export default new ManagerService()