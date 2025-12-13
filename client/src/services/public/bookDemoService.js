import { apiClient, API_ENDPOINTS } from '../api'

class BookDemoService {
  
  async sendOtp(phoneNumber, fullName) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BOOK_DEMO.SEND_OTP, {
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
      const response = await apiClient.post(API_ENDPOINTS.BOOK_DEMO.VERIFY_OTP, {
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
  
  async createBookDemo(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BOOK_DEMO.CREATE, data)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to submit demo request',
        errors: error.response?.data?.errors || []
      }
    }
  }

  async getAllBookDemos(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOOK_DEMO.LIST, {
        params
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch demo requests' 
      }
    }
  }

  async getBookDemoById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOOK_DEMO.GET(id))
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch demo request' 
      }
    }
  }

  async updateBookDemoStatus(id, isCompleted) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BOOK_DEMO.UPDATE_STATUS(id), {
        isCompleted
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update status' 
      }
    }
  }

  async deleteBookDemo(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.BOOK_DEMO.DELETE(id))
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to delete demo request' 
      }
    }
  }
}

export default new BookDemoService()

