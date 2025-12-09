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

  // Get manager stats
  async getStats(params = {}) {
    try {
      const response = await apiClient.get('/manager/stats', { params })

      // Handle obfuscated data (Base64)
      if (response.data && response.data.success && typeof response.data.data === 'string') {
        try {
          // Decode Base64 string
          response.data.data = JSON.parse(atob(response.data.data));
        } catch (e) {
          console.error("Failed to decode stats:", e);
        }
      }

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch manager stats'
      }
    }
  }

  // Get manager appointment stats (filtered)
  async getManagerAppointmentStats(params = {}) {
    try {
      const response = await apiClient.get('/manager/appointments/stats', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment stats'
      };
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

  // ================== Alert Methods (System Notifications) ==================

  // Get alerts
  async getAlerts(params = {}, config = {}) {
    try {
      const response = await apiClient.get('/manager/alerts', { params, ...config })
      return { success: true, data: response.data }
    } catch (error) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        throw error; // Let the caller handle cancellation
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch alerts'
      }
    }
  }

  // Mark alert as read
  async markAlertAsRead(id) {
    try {
      const response = await apiClient.put(`/manager/alerts/${id}/read`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark alert as read'
      }
    }
  }

  // Mark all alerts as read
  async markAllAlertsAsRead() {
    try {
      const response = await apiClient.post('/manager/alerts/mark-all-read')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark alerts as read'
      }
    }
  }

  // Create Test Notification (Debug)
  async createTestNotification() {
    try {
      const response = await apiClient.post('/manager/alerts/test')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create test notification'
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

  // ================== Appointment Methods ==================

  // Get appointment statistics
  async getAppointmentStats(params = {}) {
    try {
      const response = await apiClient.get(endpoints.appointments.stats, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment statistics'
      }
    }
  }

  // Get appointments
  async getAppointments(params = {}) {
    try {
      const response = await apiClient.get(endpoints.appointments.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointments'
      }
    }
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      const response = await apiClient.get(endpoints.appointments.getById(appointmentId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment details'
      }
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status, notes = '') {
    try {
      const response = await apiClient.patch(endpoints.appointments.updateAppointmentStatus(appointmentId), {
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