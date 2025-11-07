import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AppointmentService {
  // Get business information for booking (by businessLink)
  async getBusinessInfo(businessLink) {
    try {
      const response = await apiClient.get(endpoints.appointments.businessInfo(businessLink))
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
}

export default new AppointmentService()

