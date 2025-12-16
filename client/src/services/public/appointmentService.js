import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AppointmentService {
  // Get business information for booking (by businessLink)
  async getBusinessInfo(businessLink) {
    try {
      const response = await apiClient.get(endpoints.appointments.businessInfo(businessLink))

      // Decrypt payload if present
      if (response.data?.payload) {
        try {
          const key = "secure-reviews-key";
          const encrypted = atob(response.data.payload);
          let result = "";
          for (let i = 0; i < encrypted.length; i++) {
            result += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
          }
          const decryptedData = JSON.parse(result);
          return { success: true, data: { ...response.data, data: decryptedData } };
        } catch (e) {
          console.error("Failed to decrypt business info:", e);
          return { success: false, error: 'Security verification failed' };
        }
      }

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch business information'
      }
    }
  }

  // Get business information for booking (by businessId)
  async getBusinessInfoById(businessId) {
    try {
      const response = await apiClient.get(endpoints.appointments.businessInfoById(businessId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business information'
      }
    }
  }

  // Get services for booking (public)
  async getBusinessServices(identifier) {
    try {
      const response = await apiClient.get(endpoints.services.publicByBusiness(identifier))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch services'
      }
    }
  }

  // Get available time slots (by businessLink)
  async getAvailableSlots(businessLink, params = {}) {
    try {
      const response = await apiClient.get(endpoints.appointments.availableSlots(businessLink), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch available slots'
      }
    }
  }

  // Get available time slots (by businessId)
  async getAvailableSlotsById(businessId, params = {}) {
    try {
      const response = await apiClient.get(endpoints.appointments.availableSlotsById(businessId), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch available slots'
      }
    }
  }

  // Book appointment (by businessLink)
  async bookAppointment(businessLink, bookingData) {
    try {
      const response = await apiClient.post(endpoints.appointments.bookAppointment(businessLink), bookingData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to book appointment'
      }
    }
  }

  // Verify booking OTP
  async verifyBookAppointment(businessLink, verifyData) {
    try {
      const response = await apiClient.post(endpoints.appointments.verifyBookAppointment(businessLink), verifyData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify OTP'
      }
    }
  }

  // Book appointment (by businessId)
  async bookAppointmentById(bookingData) {
    try {
      const response = await apiClient.post(endpoints.appointments.bookAppointmentById, bookingData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to book appointment'
      }
    }
  }

  // Get appointment by confirmation code
  async getAppointmentByCode(confirmationCode) {
    try {
      const response = await apiClient.get(endpoints.appointments.appointmentByCode(confirmationCode))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment'
      }
    }
  }

  // Cancel appointment
  async cancelAppointment(confirmationCode, reason = '') {
    try {
      const response = await apiClient.post(endpoints.appointments.cancelAppointment(confirmationCode), { reason })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel appointment'
      }
    }
  }

  // Get business reviews
  async getBusinessReviews(businessId, params = {}) {
    try {
      const response = await apiClient.get(endpoints.business.reviews(businessId), { params })

      // Decrypt/Deobfuscate payload if present
      if (response.data?.payload) {
        try {
          const key = "secure-reviews-key";
          const encrypted = atob(response.data.payload);
          let result = "";
          for (let i = 0; i < encrypted.length; i++) {
            result += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
          }
          const decryptedData = JSON.parse(result);

          return {
            success: true,
            data: decryptedData.reviews || [],
            pagination: decryptedData.pagination || {}
          }
        } catch (e) {
          console.error("Failed to decrypt reviews:", e);
          return { success: false, error: 'Security verification failed' };
        }
      }

      // Fallback for non-encrypted (or legacy)
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      }
    }
  }

  // Add business review
  async addBusinessReview(businessId, reviewData) {
    try {
      const response = await apiClient.post(endpoints.business.addReview(businessId), reviewData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit review'
      }
    }
  }
}

export default new AppointmentService()

