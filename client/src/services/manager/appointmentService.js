import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class AppointmentService {
  // Get all appointments
  async getAppointments(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.APPOINTMENTS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointments' 
      }
    }
  }

  // Get single appointment
  async getAppointment(appointmentId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANAGER.APPOINTMENT(appointmentId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment' 
      }
    }
  }

  // Create appointment
  async createAppointment(appointmentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANAGER.APPOINTMENTS, appointmentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create appointment' 
      }
    }
  }

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANAGER.APPOINTMENT(appointmentId), appointmentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update appointment' 
      }
    }
  }

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MANAGER.APPOINTMENT(appointmentId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete appointment' 
      }
    }
  }

  // Get appointment statistics
  async getAppointmentStats() {
    try {
      const response = await apiClient.get('/appointments/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment statistics' 
      }
    }
  }

  // Get available slots
  async getAvailableSlots(params) {
    try {
      const endpoint = buildEndpoint('/appointments/available-slots', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch available slots' 
      }
    }
  }

  // Check availability
  async checkAvailability(dateTime, staffId, serviceId) {
    try {
      const response = await apiClient.post('/appointments/check-availability', {
        dateTime,
        staffId,
        serviceId
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check availability' 
      }
    }
  }

  // Get staff availability
  async getStaffAvailability(staffId, date) {
    try {
      const response = await apiClient.get(`/appointments/staff-availability?staffId=${staffId}&date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff availability' 
      }
    }
  }

  // Get business hours
  async getBusinessHours(businessId, date) {
    try {
      const response = await apiClient.get(`/appointments/business-hours?businessId=${businessId}&date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business hours' 
      }
    }
  }

  // Get blocked slots
  async getBlockedSlots(businessId, date) {
    try {
      const response = await apiClient.get(`/appointments/blocked-slots?businessId=${businessId}&date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch blocked slots' 
      }
    }
  }

  // Get recurring slots
  async getRecurringSlots(businessId, startDate, endDate) {
    try {
      const response = await apiClient.get(`/appointments/recurring-slots?businessId=${businessId}&startDate=${startDate}&endDate=${endDate}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch recurring slots' 
      }
    }
  }

  // Get slot recommendations
  async getSlotRecommendations(preferences) {
    try {
      const response = await apiClient.post('/appointments/slot-recommendations', preferences)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch slot recommendations' 
      }
    }
  }

  // Validate appointment
  async validateAppointment(appointmentData) {
    try {
      const response = await apiClient.post('/appointments/validate', appointmentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to validate appointment' 
      }
    }
  }

  // Calculate price
  async calculatePrice(serviceId, addOns = []) {
    try {
      const response = await apiClient.post('/appointments/calculate-price', {
        serviceId,
        addOns
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to calculate price' 
      }
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status, notes = '') {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/status`, { 
        status, 
        notes 
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update appointment status' 
      }
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDateTime, reason = '') {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, {
        newDateTime,
        reason
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reschedule appointment' 
      }
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, reason = '') {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`, {
        reason
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel appointment' 
      }
    }
  }

  // Complete appointment
  async completeAppointment(appointmentId, notes = '', services = []) {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/complete`, {
        notes,
        services
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to complete appointment' 
      }
    }
  }

  // Send confirmation
  async sendConfirmation(appointmentId) {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/send-confirmation`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send confirmation' 
      }
    }
  }

  // Send reminder
  async sendReminder(appointmentId, type = 'email') {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/send-reminder`, { type })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reminder' 
      }
    }
  }

  // Get appointment history
  async getAppointmentHistory(appointmentId) {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}/history`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment history' 
      }
    }
  }

  // Get appointment reminders
  async getAppointmentReminders(appointmentId) {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}/reminders`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment reminders' 
      }
    }
  }

  // Get appointment feedback
  async getAppointmentFeedback(appointmentId) {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}/feedback`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment feedback' 
      }
    }
  }

  // Add appointment feedback
  async addAppointmentFeedback(appointmentId, feedback) {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/feedback`, feedback)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add appointment feedback' 
      }
    }
  }

  // Get today's appointments
  async getTodayAppointments(params = {}) {
    try {
      const endpoint = buildEndpoint('/appointments/today', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch today\'s appointments' 
      }
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(params = {}) {
    try {
      const endpoint = buildEndpoint('/appointments/upcoming', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch upcoming appointments' 
      }
    }
  }

  // Get overdue appointments
  async getOverdueAppointments(params = {}) {
    try {
      const endpoint = buildEndpoint('/appointments/overdue', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch overdue appointments' 
      }
    }
  }

  // Get appointments by date
  async getAppointmentsByDate(date, params = {}) {
    try {
      const endpoint = buildEndpoint('/appointments/by-date', { date, ...params })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointments by date' 
      }
    }
  }

  // Get appointments by status
  async getAppointmentsByStatus(status, params = {}) {
    try {
      const endpoint = buildEndpoint('/appointments/by-status', { status, ...params })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointments by status' 
      }
    }
  }

  // Export appointment data
  async exportAppointmentData(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/appointments/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export appointment data' 
      }
    }
  }

  // Bulk update appointments
  async bulkUpdateAppointments(appointmentIds, updateData) {
    try {
      const response = await apiClient.patch('/appointments/bulk-update', {
        appointmentIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update appointments' 
      }
    }
  }

  // Bulk delete appointments
  async bulkDeleteAppointments(appointmentIds) {
    try {
      const response = await apiClient.delete('/appointments/bulk-delete', {
        data: { appointmentIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete appointments' 
      }
    }
  }
}

export default new AppointmentService()
