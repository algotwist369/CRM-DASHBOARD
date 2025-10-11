import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class DailyBusinessService {
  // Get all daily business records
  async getDailyBusiness(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.DAILY_BUSINESS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business records' 
      }
    }
  }

  // Get single daily business record
  async getDailyBusinessRecord(recordId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANAGER.DAILY_BUSINESS_ITEM(recordId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business record' 
      }
    }
  }

  // Create daily business record
  async createDailyBusiness(dailyBusinessData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANAGER.DAILY_BUSINESS, dailyBusinessData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create daily business record' 
      }
    }
  }

  // Update daily business record
  async updateDailyBusiness(recordId, dailyBusinessData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANAGER.DAILY_BUSINESS_ITEM(recordId), dailyBusinessData)
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
      const response = await apiClient.delete(API_ENDPOINTS.MANAGER.DAILY_BUSINESS_ITEM(recordId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete daily business record' 
      }
    }
  }

  // Get daily business statistics
  async getDailyBusinessStats() {
    try {
      const response = await apiClient.get('/daily-business/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business statistics' 
      }
    }
  }

  // Get daily business by date
  async getDailyBusinessByDate(date) {
    try {
      const response = await apiClient.get(`/daily-business/by-date?date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business by date' 
      }
    }
  }

  // Get daily business by date range
  async getDailyBusinessByDateRange(startDate, endDate, params = {}) {
    try {
      const endpoint = buildEndpoint('/daily-business/by-date-range', { 
        startDate, 
        endDate, 
        ...params 
      })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business by date range' 
      }
    }
  }

  // Get daily business summary
  async getDailyBusinessSummary(period = '30d') {
    try {
      const response = await apiClient.get(`/daily-business/summary?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business summary' 
      }
    }
  }

  // Get daily business trends
  async getDailyBusinessTrends(period = '30d') {
    try {
      const response = await apiClient.get(`/daily-business/trends?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business trends' 
      }
    }
  }

  // Get daily business analytics
  async getDailyBusinessAnalytics(period = '30d') {
    try {
      const response = await apiClient.get(`/daily-business/analytics?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business analytics' 
      }
    }
  }

  // Get daily business performance
  async getDailyBusinessPerformance(period = '30d') {
    try {
      const response = await apiClient.get(`/daily-business/performance?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business performance' 
      }
    }
  }

  // Get daily business goals
  async getDailyBusinessGoals() {
    try {
      const response = await apiClient.get('/daily-business/goals')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business goals' 
      }
    }
  }

  // Update daily business goals
  async updateDailyBusinessGoals(goals) {
    try {
      const response = await apiClient.put('/daily-business/goals', { goals })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update daily business goals' 
      }
    }
  }

  // Get daily business targets
  async getDailyBusinessTargets() {
    try {
      const response = await apiClient.get('/daily-business/targets')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business targets' 
      }
    }
  }

  // Update daily business targets
  async updateDailyBusinessTargets(targets) {
    try {
      const response = await apiClient.put('/daily-business/targets', { targets })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update daily business targets' 
      }
    }
  }

  // Get daily business metrics
  async getDailyBusinessMetrics(date) {
    try {
      const response = await apiClient.get(`/daily-business/metrics?date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business metrics' 
      }
    }
  }

  // Update daily business metrics
  async updateDailyBusinessMetrics(date, metrics) {
    try {
      const response = await apiClient.patch(`/daily-business/metrics?date=${date}`, { metrics })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update daily business metrics' 
      }
    }
  }

  // Get daily business reports
  async getDailyBusinessReports(params = {}) {
    try {
      const endpoint = buildEndpoint('/daily-business/reports', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business reports' 
      }
    }
  }

  // Generate daily business report
  async generateDailyBusinessReport(reportData) {
    try {
      const response = await apiClient.post('/daily-business/reports/generate', reportData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to generate daily business report' 
      }
    }
  }

  // Export daily business data
  async exportDailyBusinessData(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/daily-business/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export daily business data' 
      }
    }
  }

  // Bulk update daily business records
  async bulkUpdateDailyBusiness(recordIds, updateData) {
    try {
      const response = await apiClient.patch('/daily-business/bulk-update', {
        recordIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update daily business records' 
      }
    }
  }

  // Bulk delete daily business records
  async bulkDeleteDailyBusiness(recordIds) {
    try {
      const response = await apiClient.delete('/daily-business/bulk-delete', {
        data: { recordIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete daily business records' 
      }
    }
  }

  // Get daily business comparison
  async getDailyBusinessComparison(period1, period2) {
    try {
      const response = await apiClient.get(`/daily-business/comparison?period1=${period1}&period2=${period2}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business comparison' 
      }
    }
  }

  // Get daily business insights
  async getDailyBusinessInsights(period = '30d') {
    try {
      const response = await apiClient.get(`/daily-business/insights?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business insights' 
      }
    }
  }
}

export default new DailyBusinessService()
