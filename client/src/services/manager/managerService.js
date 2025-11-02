import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class ManagerService {
  // Get manager dashboard data
  async getDashboard() {
    try {
      const response = await apiClient.get(endpoints.manager.dashboard)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch dashboard data' 
      }
    }
  }

  // Get staff list
  async getStaff(params = {}) {
    try {
      const response = await apiClient.get(endpoints.manager.staff, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff' 
      }
    }
  }

  // Add staff member
  async addStaff(staffData) {
    try {
      const response = await apiClient.post(endpoints.manager.addStaff, staffData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add staff member' 
      }
    }
  }

  // Update staff member
  async updateStaff(staffId, staffData) {
    try {
      const response = await apiClient.put(endpoints.manager.updateStaff(staffId), staffData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff member' 
      }
    }
  }

  // Delete staff member
  async deleteStaff(staffId) {
    try {
      const response = await apiClient.delete(endpoints.manager.deleteStaff(staffId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete staff member' 
      }
    }
  }

  // Get transactions
  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get(endpoints.manager.transactions, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions' 
      }
    }
  }

  // Add transaction
  async addTransaction(transactionData) {
    try {
      const response = await apiClient.post(endpoints.manager.addTransaction, transactionData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add transaction' 
      }
    }
  }

  // Get daily business records
  async getDailyBusinessRecords(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business records' 
      }
    }
  }

  // Add daily business record
  async addDailyBusiness(dailyBusinessData) {
    try {
      const response = await apiClient.post(endpoints.dailyBusiness.create, dailyBusinessData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add daily business record' 
      }
    }
  }

  // Update daily business record
  async updateDailyBusiness(recordId, dailyBusinessData) {
    try {
      const response = await apiClient.put(endpoints.dailyBusiness.update(recordId), dailyBusinessData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update daily business record' 
      }
    }
  }

  // Delete daily business record
  async deleteDailyBusiness(recordId) {
    try {
      const response = await apiClient.delete(endpoints.dailyBusiness.delete(recordId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete daily business record' 
      }
    }
  }

  // Get daily summary
  async getDailySummary(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.getSummary, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily summary' 
      }
    }
  }

  // Get business analytics
  async getBusinessAnalytics(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.getAnalytics, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business analytics' 
      }
    }
  }

  // ================== Notification Methods ==================

  // Get notifications
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get(endpoints.notifications.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notifications' 
      }
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post(endpoints.notifications.create, notificationData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create notification' 
      }
    }
  }

  // Send notification
  async sendNotification(notificationId) {
    try {
      const response = await apiClient.post(endpoints.notifications.send(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send notification' 
      }
    }
  }

  // Get notification analytics
  async getNotificationAnalytics(notificationId) {
    try {
      const response = await apiClient.get(endpoints.notifications.getAnalytics(notificationId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification analytics' 
      }
    }
  }

  // Create campaign
  async createCampaign(campaignData) {
    try {
      const response = await apiClient.post(endpoints.notifications.createCampaign, campaignData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create campaign' 
      }
    }
  }

  // Get campaigns
  async getCampaigns(params = {}) {
    try {
      const response = await apiClient.get(endpoints.notifications.getCampaigns, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch campaigns' 
      }
    }
  }

  // Get customer analytics for notifications
  async getCustomerAnalytics(params = {}) {
    try {
      const response = await apiClient.get(endpoints.notifications.getCustomerAnalytics, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer analytics' 
      }
    }
  }

  // ================== Customer Methods ==================

  // Get customers
  async getCustomers(params = {}) {
    try {
      const response = await apiClient.get(endpoints.customers.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customers' 
      }
    }
  }

  // Get customer details
  async getCustomerDetails(customerId) {
    try {
      const response = await apiClient.get(endpoints.customers.getById(customerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer details' 
      }
    }
  }

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await apiClient.put(endpoints.customers.update(customerId), customerData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer' 
      }
    }
  }

  // Add customer note
  async addCustomerNote(customerId, noteData) {
    try {
      const response = await apiClient.post(endpoints.customers.addNote(customerId), noteData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add customer note' 
      }
    }
  }

  // Get customer timeline
  async getCustomerTimeline(customerId) {
    try {
      const response = await apiClient.get(endpoints.customers.getTimeline(customerId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer timeline' 
      }
    }
  }

  // Get customer segments
  async getCustomerSegments() {
    try {
      const response = await apiClient.get(endpoints.customers.getSegments)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer segments' 
      }
    }
  }

  // Get customer analytics overview
  async getCustomerAnalyticsOverview(params = {}) {
    try {
      const response = await apiClient.get(endpoints.customers.getAnalytics, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer analytics' 
      }
    }
  }

  // Get customer insights
  async getCustomerInsights() {
    try {
      const response = await apiClient.get(endpoints.customers.getInsights)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer insights' 
      }
    }
  }

  // Get target customers
  async getTargetCustomers(criteria) {
    try {
      const response = await apiClient.post(endpoints.customers.getTargetCustomers, { criteria })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch target customers' 
      }
    }
  }

  // ================== Appointment Methods ==================

  // Get appointments
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
  async updateAppointmentStatus(appointmentId, status, notes = '') {
    try {
      const response = await apiClient.put(endpoints.appointments.updateAppointmentStatus(appointmentId), {
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
}

export default new ManagerService()