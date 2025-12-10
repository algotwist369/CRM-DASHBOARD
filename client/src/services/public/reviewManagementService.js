import { apiClient, API_ENDPOINTS } from '../api'

class ReviewManagementService {
  
  async sendOtp(phoneNumber, fullName) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REVIEW_MANAGEMENT.SEND_OTP, {
        phoneNumber,
        fullName
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
      const response = await apiClient.post(API_ENDPOINTS.REVIEW_MANAGEMENT.VERIFY_OTP, {
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
  
  async createReviewRequest(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REVIEW_MANAGEMENT.CREATE, data)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to submit review request',
        errors: error.response?.data?.errors || []
      }
    }
  }

  async getAllReviewRequests(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REVIEW_MANAGEMENT.LIST, {
        params
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch review requests' 
      }
    }
  }

  async getReviewRequestById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REVIEW_MANAGEMENT.GET(id))
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch review request' 
      }
    }
  }

  async updateReviewRequest(id, data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.REVIEW_MANAGEMENT.UPDATE(id), data)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update review request',
        errors: error.response?.data?.errors || []
      }
    }
  }

  async deleteReviewRequest(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.REVIEW_MANAGEMENT.DELETE(id))
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to delete review request' 
      }
    }
  }
}

export default new ReviewManagementService()

