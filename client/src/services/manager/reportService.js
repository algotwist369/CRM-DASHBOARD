import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class ReportService {
  // Get all reports
  async getReports(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.REPORTS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch reports' 
      }
    }
  }

  // Get single report
  async getReport(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch report' 
      }
    }
  }

  // Generate report
  async generateReport(reportData) {
    try {
      const response = await apiClient.post('/reports/generate', reportData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to generate report' 
      }
    }
  }

  // Update report
  async updateReport(reportId, reportData) {
    try {
      const response = await apiClient.put(`/reports/${reportId}`, reportData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update report' 
      }
    }
  }

  // Delete report
  async deleteReport(reportId) {
    try {
      const response = await apiClient.delete(`/reports/${reportId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete report' 
      }
    }
  }

  // Get report data
  async getReportData(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/data`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch report data' 
      }
    }
  }

  // Download report
  async downloadReport(reportId, format = 'pdf') {
    try {
      const response = await apiClient.get(`/reports/${reportId}/download?format=${format}`, {
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to download report' 
      }
    }
  }

  // Schedule report
  async scheduleReport(reportId, schedule) {
    try {
      const response = await apiClient.post(`/reports/${reportId}/schedule`, schedule)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to schedule report' 
      }
    }
  }

  // Get report templates
  async getReportTemplates() {
    try {
      const response = await apiClient.get('/reports/templates')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch report templates' 
      }
    }
  }

  // Create report from template
  async createReportFromTemplate(templateId, customizations = {}) {
    try {
      const response = await apiClient.post('/reports/from-template', {
        templateId,
        customizations
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create report from template' 
      }
    }
  }

  // Get report types
  async getReportTypes() {
    try {
      const response = await apiClient.get('/reports/types')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch report types' 
      }
    }
  }

  // Get report statistics
  async getReportStats() {
    try {
      const response = await apiClient.get('/reports/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch report statistics' 
      }
    }
  }

  // Get scheduled reports
  async getScheduledReports() {
    try {
      const response = await apiClient.get('/reports/scheduled')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch scheduled reports' 
      }
    }
  }

  // Get recent reports
  async getRecentReports(limit = 10) {
    try {
      const response = await apiClient.get(`/reports/recent?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch recent reports' 
      }
    }
  }

  // Export reports
  async exportReports(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/reports/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export reports' 
      }
    }
  }

  // Get business performance report
  async getBusinessPerformanceReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/business-performance?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business performance report' 
      }
    }
  }

  // Get staff performance report
  async getStaffPerformanceReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/staff-performance?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff performance report' 
      }
    }
  }

  // Get customer analytics report
  async getCustomerAnalyticsReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/customer-analytics?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer analytics report' 
      }
    }
  }

  // Get appointment report
  async getAppointmentReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/appointments?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment report' 
      }
    }
  }

  // Get transaction report
  async getTransactionReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/transactions?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transaction report' 
      }
    }
  }

  // Get revenue report
  async getRevenueReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/revenue?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch revenue report' 
      }
    }
  }

  // Get daily business report
  async getDailyBusinessReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/daily-business?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business report' 
      }
    }
  }

  // Get notification report
  async getNotificationReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/notifications?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification report' 
      }
    }
  }

  // Get campaign report
  async getCampaignReport(period = '30d') {
    try {
      const response = await apiClient.get(`/reports/campaigns?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch campaign report' 
      }
    }
  }

  // Get custom report
  async getCustomReport(reportConfig) {
    try {
      const response = await apiClient.post('/reports/custom', reportConfig)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch custom report' 
      }
    }
  }

  // Get report insights
  async getReportInsights(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/insights`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch report insights' 
      }
    }
  }

  // Share report
  async shareReport(reportId, shareData) {
    try {
      const response = await apiClient.post(`/reports/${reportId}/share`, shareData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to share report' 
      }
    }
  }

  // Get shared reports
  async getSharedReports() {
    try {
      const response = await apiClient.get('/reports/shared')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch shared reports' 
      }
    }
  }
}

export default new ReportService()
