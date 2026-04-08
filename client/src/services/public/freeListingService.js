import { API_ENDPOINTS } from '../api'
import apiClient from './client'

class FreeListingService {
  constructor() {
    console.log('🚀 [FreeListingService] Initialized - OTP methods removed')
  }

  async createFreeListing(formData) {
    try {
      // Axios automatically sets Content-Type to multipart/form-data with boundary for FormData
      // Don't manually set Content-Type as axios needs to set it with the proper boundary
      const response = await apiClient.post(
        API_ENDPOINTS.FREE_LISTING.CREATE,
        formData
      )
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create listing',
        errors: error.response?.data?.errors || []
      }
    }
  }

  async getAllFreeListings(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FREE_LISTING.LIST, {
        params
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch listings'
      }
    }
  }


  async getFreeListingById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FREE_LISTING.GET(id))
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch listing'
      }
    }
  }

  async updateFreeListing(id, formData) {
    try {
      // Axios automatically sets Content-Type to multipart/form-data with boundary for FormData
      // Don't manually set Content-Type as axios needs to set it with the proper boundary
      const response = await apiClient.put(
        API_ENDPOINTS.FREE_LISTING.UPDATE(id),
        formData
      )
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update listing',
        errors: error.response?.data?.errors || []
      }
    }
  }


  async deleteFreeListing(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.FREE_LISTING.DELETE(id))
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete listing'
      }
    }
  }
}

export default new FreeListingService()

