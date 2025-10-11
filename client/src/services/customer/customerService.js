import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class CustomerService {
  // Get customers list
  async getCustomers(params = {}) {
    try {
      const response = await apiClient.get(endpoints.customers.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customers' 
      }
    }
  }

  // Get customer details
  async getCustomerDetails(customerId) {
    try {
      const response = await apiClient.get(endpoints.customers.getById(customerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer details' 
      }
    }
  }

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await apiClient.put(endpoints.customers.update(customerId), customerData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer' 
      }
    }
  }

  // Add customer note
  async addCustomerNote(customerId, noteData) {
    try {
      const response = await apiClient.post(endpoints.customers.addNote(customerId), noteData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add customer note' 
      }
    }
  }

  // Get customer timeline
  async getCustomerTimeline(customerId) {
    try {
      const response = await apiClient.get(endpoints.customers.getTimeline(customerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer timeline' 
      }
    }
  }

  // Get customer segments
  async getCustomerSegments() {
    try {
      const response = await apiClient.get(endpoints.customers.getSegments)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer segments' 
      }
    }
  }

  // Get customer analytics
  async getCustomerAnalytics() {
    try {
      const response = await apiClient.get(endpoints.customers.getAnalytics)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer analytics' 
      }
    }
  }

  // Get customer insights
  async getCustomerInsights() {
    try {
      const response = await apiClient.get(endpoints.customers.getInsights)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer insights' 
      }
    }
  }

  // Get target customers
  async getTargetCustomers(criteria) {
    try {
      const response = await apiClient.post(endpoints.customers.getTargetCustomers, criteria)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch target customers' 
      }
    }
  }
}

export default new CustomerService()
