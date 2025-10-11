import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class DailyBusinessService {
  // Add daily business record
  async addDailyBusiness(dailyBusinessData) {
    try {
      const response = await apiClient.post(endpoints.dailyBusiness.create, dailyBusinessData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add daily business record' 
      }
    }
  }

  // Get daily business records
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

  // Get daily summary
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

  // Get business analytics
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

  // Update daily business record
  async updateDailyBusiness(recordId, dailyBusinessData) {
    try {
      const response = await apiClient.put(endpoints.dailyBusiness.update(recordId), dailyBusinessData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update daily business record' 
      }
    }
  }

  // Delete daily business record
  async deleteDailyBusiness(recordId) {
    try {
      const response = await apiClient.delete(endpoints.dailyBusiness.delete(recordId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete daily business record' 
      }
    }
  }
}

export default new DailyBusinessService()
