import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class CustomerService {
  // Get all customers
  async getCustomers(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.CUSTOMERS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customers' 
      }
    }
  }

  // Get single customer
  async getCustomer(customerId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANAGER.CUSTOMER(customerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer' 
      }
    }
  }

  // Create customer
  async createCustomer(customerData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANAGER.CUSTOMERS, customerData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create customer' 
      }
    }
  }

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANAGER.CUSTOMER(customerId), customerData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer' 
      }
    }
  }

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MANAGER.CUSTOMER(customerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete customer' 
      }
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      const response = await apiClient.get('/customers/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer statistics' 
      }
    }
  }

  // Get customer appointments
  async getCustomerAppointments(customerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/customers/${customerId}/appointments`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer appointments' 
      }
    }
  }

  // Get customer transactions
  async getCustomerTransactions(customerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/customers/${customerId}/transactions`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer transactions' 
      }
    }
  }

  // Get customer history
  async getCustomerHistory(customerId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/customers/${customerId}/history`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer history' 
      }
    }
  }

  // Get customer notes
  async getCustomerNotes(customerId) {
    try {
      const response = await apiClient.get(`/customers/${customerId}/notes`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer notes' 
      }
    }
  }

  // Add customer note
  async addCustomerNote(customerId, note) {
    try {
      const response = await apiClient.post(`/customers/${customerId}/notes`, { note })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add customer note' 
      }
    }
  }

  // Get customer loyalty points
  async getCustomerLoyaltyPoints(customerId) {
    try {
      const response = await apiClient.get(`/customers/${customerId}/loyalty-points`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer loyalty points' 
      }
    }
  }

  // Update customer loyalty points
  async updateCustomerLoyaltyPoints(customerId, points, reason) {
    try {
      const response = await apiClient.patch(`/customers/${customerId}/loyalty-points`, { 
        points, 
        reason 
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer loyalty points' 
      }
    }
  }

  // Get customer segments
  async getCustomerSegments(customerId) {
    try {
      const response = await apiClient.get(`/customers/${customerId}/segments`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer segments' 
      }
    }
  }

  // Add customer to segment
  async addCustomerToSegment(customerId, segmentId) {
    try {
      const response = await apiClient.post(`/customers/${customerId}/segments`, { segmentId })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add customer to segment' 
      }
    }
  }

  // Remove customer from segment
  async removeCustomerFromSegment(customerId, segmentId) {
    try {
      const response = await apiClient.delete(`/customers/${customerId}/segments/${segmentId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove customer from segment' 
      }
    }
  }

  // Update customer status
  async updateCustomerStatus(customerId, status) {
    try {
      const response = await apiClient.patch(`/customers/${customerId}/status`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer status' 
      }
    }
  }

  // Update customer preferences
  async updateCustomerPreferences(customerId, preferences) {
    try {
      const response = await apiClient.patch(`/customers/${customerId}/preferences`, { preferences })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer preferences' 
      }
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(period = '30d') {
    try {
      const response = await apiClient.get(`/customers/analytics?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer analytics' 
      }
    }
  }

  // Get customer segments list
  async getCustomerSegmentsList() {
    try {
      const response = await apiClient.get('/customers/segments')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer segments' 
      }
    }
  }

  // Get customers by segment
  async getCustomersBySegment(segmentId) {
    try {
      const response = await apiClient.get(`/customers/segment/${segmentId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customers by segment' 
      }
    }
  }

  // Get top customers
  async getTopCustomers(params = {}) {
    try {
      const endpoint = buildEndpoint('/customers/top', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch top customers' 
      }
    }
  }

  // Get new customers
  async getNewCustomers(params = {}) {
    try {
      const endpoint = buildEndpoint('/customers/new', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch new customers' 
      }
    }
  }

  // Get inactive customers
  async getInactiveCustomers(params = {}) {
    try {
      const endpoint = buildEndpoint('/customers/inactive', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch inactive customers' 
      }
    }
  }

  // Export customer data
  async exportCustomerData(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/customers/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export customer data' 
      }
    }
  }

  // Bulk update customers
  async bulkUpdateCustomers(customerIds, updateData) {
    try {
      const response = await apiClient.patch('/customers/bulk-update', {
        customerIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update customers' 
      }
    }
  }

  // Bulk delete customers
  async bulkDeleteCustomers(customerIds) {
    try {
      const response = await apiClient.delete('/customers/bulk-delete', {
        data: { customerIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete customers' 
      }
    }
  }
}

export default new CustomerService()
