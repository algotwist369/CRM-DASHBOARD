import apiClient from './api/client'
import { endpoints } from '../constants/api/endpoints'

class BusinessSettingsService {
  // Get business settings
  // businessId: required for admin (pass as query param), optional for manager (backend auto-detects)
  async getBusinessSettings(businessId = null) {
    try {
      const params = {}
      // Only add businessId if provided and valid (required for admin, optional for manager)
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        params.businessId = businessId
      }
      const response = await apiClient.get(endpoints.businessSettings.get, { params })
      return { success: true, data: response.data?.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch business settings'
      }
    }
  }

  // Update business hours (businessId is optional for managers - backend auto-detects)
  async updateBusinessHours(businessId, businessHours) {
    try {
      const payload = { businessHours }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      
      console.log('Updating business hours:', { businessId, businessHours: Object.keys(businessHours) })
      
      const response = await apiClient.put(endpoints.businessSettings.updateBusinessHours, payload)
      
      console.log('Business hours update response:', response.data)
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      }
    } catch (error) {
      console.error('Error updating business hours:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to update business hours'
      }
    }
  }

  // Update appointment settings (businessId is optional for managers)
  async updateAppointmentSettings(businessId, appointmentSettings) {
    try {
      const payload = { appointmentSettings }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      
      console.log('Updating appointment settings:', { businessId, appointmentSettings })
      
      const response = await apiClient.put(endpoints.businessSettings.updateAppointments, payload)
      
      return { 
        success: true, 
        data: response.data?.data || response.data 
      }
    } catch (error) {
      console.error('Error updating appointment settings:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to update appointment settings'
      }
    }
  }

  // Update notification preferences (businessId is optional for managers)
  async updateNotificationPreferences(businessId, notificationPreferences) {
    try {
      const payload = { notificationPreferences }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.put(endpoints.businessSettings.updateNotifications, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update notification preferences'
      }
    }
  }

  // Update payment settings (businessId is optional for managers)
  async updatePaymentSettings(businessId, paymentMethods, bankDetails) {
    try {
      const payload = { paymentMethods, bankDetails }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.put(endpoints.businessSettings.updatePayments, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update payment settings'
      }
    }
  }

  // Update tax settings (businessId is optional for managers)
  async updateTaxSettings(businessId, taxSettings) {
    try {
      const payload = { taxSettings }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.put(endpoints.businessSettings.updateTax, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update tax settings'
      }
    }
  }

  // Update general settings (businessId is optional for managers)
  async updateGeneralSettings(businessId, generalSettings) {
    try {
      const payload = { generalSettings }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.put(endpoints.businessSettings.updateGeneral, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update general settings'
      }
    }
  }

  // Update loyalty settings (businessId is optional for managers)
  async updateLoyaltySettings(businessId, loyaltySettings) {
    try {
      const payload = { loyaltySettings }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.put(endpoints.businessSettings.updateLoyalty, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update loyalty settings'
      }
    }
  }

  // Add holiday (businessId is optional for managers)
  async addHoliday(businessId, date, reason) {
    try {
      const payload = { date, reason }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.post(endpoints.businessSettings.addHoliday, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add holiday'
      }
    }
  }

  // Remove holiday (businessId is optional for managers)
  async removeHoliday(businessId, date) {
    try {
      const payload = { date }
      if (businessId && businessId !== 'undefined' && businessId !== 'null' && String(businessId).trim() !== '') {
        payload.businessId = businessId
      }
      const response = await apiClient.delete(endpoints.businessSettings.removeHoliday, {
        data: payload
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove holiday'
      }
    }
  }
}

export default new BusinessSettingsService()

