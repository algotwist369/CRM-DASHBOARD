import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class BusinessService {
  // Get all businesses
  async getBusinesses(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.businesses, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch businesses'
      }
    }
  }

  // Get single business by ID (uses GET /api/admin/:id)
  async getBusiness(businessId) {
    try {
      const response = await apiClient.get(endpoints.admin.business(businessId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business'
      }
    }
  }

  // Get business link (GET /api/admin/business/:businessId/link)
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

  // Create business
  async createBusiness(businessData) {
    try {
      const response = await apiClient.post(endpoints.admin.createBusiness, businessData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create business'
      }
    }
  }

  // Update business
  async updateBusiness(businessId, businessData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateBusiness(businessId), businessData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update business'
      }
    }
  }

  // Delete business
  async deleteBusiness(businessId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteBusiness(businessId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete business'
      }
    }
  }

  // Update business remark
  async updateBusinessRemark(businessId, remark) {
    try {
      const response = await apiClient.put(endpoints.admin.businessRemark(businessId), { remark })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update remark'
      }
    }
  }

  // Get business statistics
  async getBusinessStats(businessId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUSINESS.STATS(businessId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business statistics'
      }
    }
  }

  // Get business staff
  async getBusinessStaff(businessId, params = {}) {
    try {
      const response = await apiClient.get(endpoints.business.getStaff(businessId), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business staff'
      }
    }
  }

  // Get business daily records
  async getBusinessDailyRecords(businessId, params = {}) {
    try {
      const response = await apiClient.get(endpoints.business.getDailyRecords(businessId), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch daily records'
      }
    }
  }

  // Get business customers
  async getBusinessCustomers(businessId, params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.BUSINESS.CUSTOMERS(businessId), params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business customers'
      }
    }
  }

  // Get business appointments
  async getBusinessAppointments(businessId, params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.BUSINESS.APPOINTMENTS(businessId), params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business appointments'
      }
    }
  }

  // Get business transactions
  async getBusinessTransactions(businessId, params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.BUSINESS.TRANSACTIONS(businessId), params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business transactions'
      }
    }
  }

  // Get business analytics
  async getBusinessAnalytics(businessId, params = {}) {
    try {
      const response = await apiClient.get(endpoints.business.getAnalytics(businessId), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business analytics'
      }
    }
  }

  // Export business data
  async exportBusinessData(businessId, format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint(API_ENDPOINTS.BUSINESS.EXPORT(businessId), params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export business data'
      }
    }
  }

  // Update business status
  async updateBusinessStatus(businessId, status) {
    try {
      const response = await apiClient.put(endpoints.admin.updateBusinessStatus(businessId), { isActive: status })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update business status'
      }
    }
  }

  // Update business settings
  async updateBusinessSettings(businessId, settings) {
    try {
      const response = await apiClient.patch(`/businesses/${businessId}/settings`, settings)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update business settings'
      }
    }
  }

  // Get business services
  async getBusinessServices(businessId) {
    try {
      const response = await apiClient.get(`/businesses/${businessId}/services`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business services'
      }
    }
  }

  // Get business hours
  async getBusinessHours(businessId) {
    try {
      const response = await apiClient.get(`/businesses/${businessId}/hours`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business hours'
      }
    }
  }

  // Update business hours
  async updateBusinessHours(businessId, hours) {
    try {
      const response = await apiClient.patch(`/businesses/${businessId}/hours`, hours)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update business hours'
      }
    }
  }

  // Get business reviews
  async getBusinessReviews(businessId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/businesses/${businessId}/reviews`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business reviews'
      }
    }
  }

  // Get business performance metrics
  async getBusinessPerformance(businessId, period = '30d') {
    try {
      const response = await apiClient.get(`/businesses/${businessId}/performance?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business performance'
      }
    }
  }

  // Bulk update businesses
  async bulkUpdateBusinesses(businessIds, updateData) {
    try {
      const response = await apiClient.patch('/businesses/bulk-update', {
        businessIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to bulk update businesses'
      }
    }
  }

  // Bulk delete businesses
  async bulkDeleteBusinesses(businessIds) {
    try {
      const response = await apiClient.delete('/businesses/bulk-delete', {
        data: { businessIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to bulk delete businesses'
      }
    }
  }
}

export default new BusinessService()
