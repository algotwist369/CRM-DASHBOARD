import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class ReportService {
  // Get reports
  async getReports(params = {}) {
    try {
      const response = await apiClient.get(endpoints.reports.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch reports' 
      }
    }
  }

  // Get analytics
  async getAnalytics(params = {}) {
    try {
      const response = await apiClient.get(endpoints.reports.getAnalytics, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch analytics' 
      }
    }
  }

  // Export reports
  async exportReports(format = 'csv', filters = {}) {
    try {
      const response = await apiClient.get(endpoints.reports.export, {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export reports' 
      }
    }
  }
}

export default new ReportService()
