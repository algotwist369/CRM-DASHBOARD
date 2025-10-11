import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class AppointmentService {
  // Get business info for booking
  async getBusinessInfo(businessLink) {
    try {
      const response = await apiClient.get(endpoints.appointments.businessInfo(businessLink))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business information' 
      }
    }
  }

  // Get available time slots
  async getAvailableSlots(businessLink, date) {
    try {
      const response = await apiClient.get(endpoints.appointments.availableSlots(businessLink), {
        params: { date }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch available slots' 
      }
    }
  }

  // Book appointment
  async bookAppointment(businessLink, appointmentData) {
    try {
      const response = await apiClient.post(endpoints.appointments.bookAppointment(businessLink), appointmentData)
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
  async cancelAppointment(confirmationCode) {
    try {
      const response = await apiClient.post(endpoints.appointments.cancelAppointment(confirmationCode))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel appointment' 
      }
    }
  }

  // Get appointments (for managers)
  async getAppointments(params = {}) {
    try {
      const response = await apiClient.get(endpoints.appointments.getAppointments, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointments' 
      }
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    try {
      const response = await apiClient.put(endpoints.appointments.updateAppointmentStatus(appointmentId), { status })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update appointment status' 
      }
    }
  }
}

export default new AppointmentService()
