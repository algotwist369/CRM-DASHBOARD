import { API_ENDPOINTS } from '../api'
import apiClient from './client'

class AdvertiseService {
  
  async sendOtp(phoneNumber, name) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADVERTISE.SEND_OTP, {
        phoneNumber,
        name
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to send OTP' 
      }
    }
  }

  async verifyOtp(phoneNumber, otp) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADVERTISE.VERIFY_OTP, {
        phoneNumber,
        otp
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to verify OTP' 
      }
    }
  }
  
  async createAdvertise(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADVERTISE.CREATE, data)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to submit advertising request',
        errors: error.response?.data?.errors || []
      }
    }
  }

  async getAllAdvertise(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADVERTISE.LIST, {
        params
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch advertising requests' 
      }
    }
  }

  async getAdvertiseById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADVERTISE.GET(id))
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch advertising request' 
      }
    }
  }

  async updateAdvertise(id, data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ADVERTISE.UPDATE(id), data)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update advertising request',
        errors: error.response?.data?.errors || []
      }
    }
  }

  async deleteAdvertise(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ADVERTISE.DELETE(id))
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to delete advertising request' 
      }
    }
  }
}

export default new AdvertiseService()

