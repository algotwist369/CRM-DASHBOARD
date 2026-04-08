import {apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class BookingService {
  // Create booking
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PUBLIC.BOOKING, bookingData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create booking' 
      }
    }
  }

  // Validate booking
  async validateBooking(bookingData) {
    try {
      const response = await apiClient.post('/public/booking/validate', bookingData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to validate booking' 
      }
    }
  }

  // Check availability
  async checkAvailability(availabilityData) {
    try {
      const response = await apiClient.post('/public/booking/check-availability', availabilityData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check availability' 
      }
    }
  }

  // Calculate booking price
  async calculatePrice(priceData) {
    try {
      const response = await apiClient.post('/public/booking/calculate-price', priceData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to calculate price' 
      }
    }
  }

  // Get booking confirmation
  async getBookingConfirmation(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/confirmation/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking confirmation' 
      }
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, reason = '') {
    try {
      const response = await apiClient.post(`/public/booking/cancel/${bookingId}`, { reason })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel booking' 
      }
    }
  }

  // Reschedule booking
  async rescheduleBooking(bookingId, newDateTime, reason = '') {
    try {
      const response = await apiClient.post(`/public/booking/reschedule/${bookingId}`, {
        newDateTime,
        reason
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reschedule booking' 
      }
    }
  }

  // Get booking status
  async getBookingStatus(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/status/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking status' 
      }
    }
  }

  // Get booking details
  async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/details/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking details' 
      }
    }
  }

  // Update booking
  async updateBooking(bookingId, updateData) {
    try {
      const response = await apiClient.put(`/public/booking/update/${bookingId}`, updateData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update booking' 
      }
    }
  }

  // Add booking notes
  async addBookingNotes(bookingId, notes) {
    try {
      const response = await apiClient.post(`/public/booking/notes/${bookingId}`, { notes })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add booking notes' 
      }
    }
  }

  // Get booking history
  async getBookingHistory(customerId) {
    try {
      const response = await apiClient.get(`/public/booking/history/${customerId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking history' 
      }
    }
  }

  // Get booking reminders
  async getBookingReminders(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/reminders/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking reminders' 
      }
    }
  }

  // Send booking reminder
  async sendBookingReminder(bookingId, type = 'email') {
    try {
      const response = await apiClient.post(`/public/booking/send-reminder/${bookingId}`, { type })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send booking reminder' 
      }
    }
  }

  // Get booking feedback
  async getBookingFeedback(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/feedback/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking feedback' 
      }
    }
  }

  // Submit booking feedback
  async submitBookingFeedback(bookingId, feedbackData) {
    try {
      const response = await apiClient.post(`/public/booking/feedback/${bookingId}`, feedbackData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to submit booking feedback' 
      }
    }
  }

  // Get booking invoice
  async getBookingInvoice(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/invoice/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking invoice' 
      }
    }
  }

  // Download booking invoice
  async downloadBookingInvoice(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/invoice/${bookingId}/download`, {
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to download booking invoice' 
      }
    }
  }

  // Get booking receipt
  async getBookingReceipt(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/receipt/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking receipt' 
      }
    }
  }

  // Download booking receipt
  async downloadBookingReceipt(bookingId) {
    try {
      const response = await apiClient.get(`/public/booking/receipt/${bookingId}/download`, {
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to download booking receipt' 
      }
    }
  }

  // Get booking calendar
  async getBookingCalendar(businessId, month, year) {
    try {
      const response = await apiClient.get(`/public/booking/calendar?businessId=${businessId}&month=${month}&year=${year}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking calendar' 
      }
    }
  }

  // Get available time slots
  async getAvailableTimeSlots(businessId, date, serviceId, staffId) {
    try {
      const params = { businessId, date, serviceId, staffId }
      const endpoint = buildEndpoint('/public/booking/available-slots', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch available time slots' 
      }
    }
  }

  // Get booking policies
  async getBookingPolicies(businessId) {
    try {
      const response = await apiClient.get(`/public/booking/policies?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking policies' 
      }
    }
  }

  // Get booking terms
  async getBookingTerms(businessId) {
    try {
      const response = await apiClient.get(`/public/booking/terms?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking terms' 
      }
    }
  }

  // Get booking FAQ
  async getBookingFAQ(businessId) {
    try {
      const response = await apiClient.get(`/public/booking/faq?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking FAQ' 
      }
    }
  }

  // Get booking support
  async getBookingSupport(businessId) {
    try {
      const response = await apiClient.get(`/public/booking/support?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking support' 
      }
    }
  }

  // Contact booking support
  async contactBookingSupport(businessId, supportData) {
    try {
      const response = await apiClient.post('/public/booking/contact-support', {
        businessId,
        ...supportData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to contact booking support' 
      }
    }
  }
}

export default new BookingService()
