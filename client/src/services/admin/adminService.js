import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AdminService {
  // Get admin dashboard
  async getDashboard(page = 1, limit = 5) {
    try {
      const response = await apiClient.get(endpoints.admin.dashboard, {
        params: { page, limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard'
      }
    }
  }

  // Get admin stats
  async getStats(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.stats, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats'
      }
    }
  }

  // Get admin profile
  async getProfile() {
    try {
      const response = await apiClient.get(endpoints.admin.getProfile)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile'
      }
    }
  }

  // Update admin profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateProfile, profileData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      }
    }
  }

  // Update admin password
  async updatePassword(passwordData) {
    try {
      const response = await apiClient.put(endpoints.admin.updatePassword, passwordData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update password'
      }
    }
  }

  // Get managers
  async getManagers(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.managers, { params })
      // Backend returns { success: true, data: [...], pagination: {...} }
      // Return it directly to maintain structure
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch managers'
      }
    }
  }

  // Get manager by ID
  async getManager(managerId) {
    try {
      const response = await apiClient.get(endpoints.admin.manager(managerId))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch manager'
      }
    }
  }

  // Create manager
  async createManager(managerData) {
    try {
      const response = await apiClient.post(endpoints.admin.createManager, managerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create manager'
      }
    }
  }

  // Update manager
  async updateManager(managerId, managerData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateManager(managerId), managerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update manager'
      }
    }
  }

  // Update manager status
  async updateManagerStatus(managerId, status) {
    try {
      const response = await apiClient.put(endpoints.admin.updateManagerStatus(managerId), { isActive: status })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update manager status'
      }
    }
  }

  // Delete manager
  async deleteManager(managerId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteManager(managerId))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete manager'
      }
    }
  }

  // ================== DAILY BUSINESS MANAGEMENT ==================

  // Get daily business records (Admin access)
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

  // Get daily summary (Admin access)
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

  // Get business analytics (Admin access)
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

  // Get daily business list (Admin access)
  async getDailyBusinessList(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.list, { params })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch daily business list'
      }
    }
  }

  // ================== ADMIN NOTIFICATIONS ==================

  // Get admin notifications
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.notifications, { params })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications'
      }
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      const response = await apiClient.get(endpoints.admin.unreadCount)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unread count'
      }
    }
  }

  // Get recent notifications
  async getRecentNotifications(limit = 5) {
    try {
      const response = await apiClient.get(endpoints.admin.recentNotifications, {
        params: { limit }
      })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch recent notifications'
      }
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.put(endpoints.admin.markNotificationRead(notificationId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read'
      }
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.put(endpoints.admin.markAllNotificationsRead)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read'
      }
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteNotification(notificationId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      }
    }
  }

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteAllNotifications)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete all notifications'
      }
    }
  }

  // ================== ADMIN PROFILE & SETTINGS ==================

  // Get admin profile
  async getAdminProfile() {
    try {
      const response = await apiClient.get(endpoints.admin.getProfile)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch admin profile'
      }
    }
  }

  // Update admin profile
  async updateAdminProfile(profileData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateProfile, profileData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update admin profile'
      }
    }
  }

  // Update admin password
  async updateAdminPassword(passwordData) {
    try {
      const response = await apiClient.put(endpoints.admin.updatePassword, passwordData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update password'
      }
    }
  }

  // ================== BUSINESS MANAGEMENT ==================

  // Create business
  async createBusiness(businessData) {
    try {
      const response = await apiClient.post(endpoints.admin.createBusiness, businessData)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create business'
      }
    }
  }

  // Get all businesses
  async getBusinesses(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.businesses, { params })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch businesses'
      }
    }
  }

  // Get business link
  async getBusinessLink(businessId) {
    try {
      const response = await apiClient.get(endpoints.admin.businessLink(businessId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business link'
      }
    }
  }

  // Get business by ID
  async getBusinessById(businessId) {
    try {
      const response = await apiClient.get(endpoints.admin.business(businessId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business'
      }
    }
  }

  // Update business
  async updateBusiness(businessId, businessData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateBusiness(businessId), businessData)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update business'
      }
    }
  }

  // Delete business
  async deleteBusiness(businessId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteBusiness(businessId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete business'
      }
    }
  }

  // ============ CAMPAIGN MANAGEMENT ============

  // Get all campaigns
  async getCampaigns(params = {}) {
    try {
      // Filter out invalid businessId values
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.campaigns.list, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaigns'
      }
    }
  }

  // Get campaign stats
  async getCampaignStats(params = {}) {
    try {
      // Filter out invalid businessId values
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.campaigns.stats, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaign stats'
      }
    }
  }

  // Get campaign by ID
  async getCampaign(id) {
    try {
      const response = await apiClient.get(endpoints.campaigns.getById(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaign'
      }
    }
  }

  // Create campaign
  async createCampaign(campaignData) {
    try {
      const response = await apiClient.post(endpoints.campaigns.create, campaignData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create campaign'
      }
    }
  }

  // Update campaign
  async updateCampaign(id, campaignData) {
    try {
      const response = await apiClient.put(endpoints.campaigns.update(id), campaignData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update campaign'
      }
    }
  }

  // Delete campaign
  async deleteCampaign(id) {
    try {
      const response = await apiClient.delete(endpoints.campaigns.delete(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete campaign'
      }
    }
  }


  // Launch campaign
  async launchCampaign(id) {
    try {
      const response = await apiClient.post(endpoints.campaigns.launch(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to launch campaign'
      }
    }
  }

  // Cancel campaign
  async cancelCampaign(id) {
    try {
      const response = await apiClient.post(endpoints.campaigns.cancel(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel campaign'
      }
    }
  }

  // Clone campaign
  async cloneCampaign(id) {
    try {
      const response = await apiClient.post(endpoints.campaigns.clone(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clone campaign'
      }
    }
  }

  // ============ CAMPAIGN TEMPLATES ============

  // Get campaign templates
  async getCampaignTemplates(params = {}) {
    try {
      const response = await apiClient.get(endpoints.campaigns.templates, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch templates'
      }
    }
  }

  // Get popular templates
  async getPopularTemplates() {
    try {
      const response = await apiClient.get(endpoints.campaigns.popularTemplates)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch popular templates'
      }
    }
  }

  // Get template by ID
  async getCampaignTemplate(id) {
    try {
      const response = await apiClient.get(endpoints.campaigns.getTemplate(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch template'
      }
    }
  }

  // Create campaign template
  async createCampaignTemplate(templateData) {
    try {
      const response = await apiClient.post(endpoints.campaigns.createTemplate, templateData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create template'
      }
    }
  }

  // Update campaign template
  async updateCampaignTemplate(id, templateData) {
    try {
      const response = await apiClient.put(endpoints.campaigns.updateTemplate(id), templateData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update template'
      }
    }
  }

  // Delete campaign template
  async deleteCampaignTemplate(id) {
    try {
      const response = await apiClient.delete(endpoints.campaigns.deleteTemplate(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete template'
      }
    }
  }

  // ==================== Automated Campaigns ====================

  // Get automated campaigns
  async getAutomatedCampaigns(params = {}) {
    try {
      const response = await apiClient.get(endpoints.campaigns.automated, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch automated campaigns'
      }
    }
  }

  // Get automated campaign by ID
  async getAutomatedCampaign(id) {
    try {
      const response = await apiClient.get(`${endpoints.campaigns.automated}/${id}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch automated campaign'
      }
    }
  }

  // Create automated campaign
  async createAutomatedCampaign(campaignData) {
    try {
      const response = await apiClient.post(endpoints.campaigns.automated, campaignData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create automated campaign'
      }
    }
  }

  // Update automated campaign
  async updateAutomatedCampaign(id, campaignData) {
    try {
      const response = await apiClient.put(`${endpoints.campaigns.automated}/${id}`, campaignData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update automated campaign'
      }
    }
  }

  // Delete automated campaign
  async deleteAutomatedCampaign(id) {
    try {
      const response = await apiClient.delete(`${endpoints.campaigns.automated}/${id}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete automated campaign'
      }
    }
  }

  // Trigger automated campaign manually
  async triggerAutomatedCampaign(id) {
    try {
      const response = await apiClient.post(`${endpoints.campaigns.automated}/${id}/trigger`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to trigger automated campaign'
      }
    }
  }

  // ============ CAMPAIGN ANALYTICS ============

  // Get campaign insights
  async getCampaignInsights() {
    try {
      const response = await apiClient.get(endpoints.campaigns.insights)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch insights'
      }
    }
  }

  // Compare campaigns
  async compareCampaigns(campaignIds) {
    try {
      const response = await apiClient.post(endpoints.campaigns.compareCampaigns, { campaignIds })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to compare campaigns'
      }
    }
  }

  // Get best time to send
  async getBestTimeToSend() {
    try {
      const response = await apiClient.get(endpoints.campaigns.bestTimeToSend)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch best time'
      }
    }
  }

  // ============ CUSTOMER MANAGEMENT ============

  // Get customers
  async getCustomers(params = {}) {
    try {
      // Filter out invalid businessId values
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.customers.list, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customers'
      }
    }
  }

  // Get customer by ID
  async getCustomer(id) {
    try {
      const response = await apiClient.get(endpoints.customers.getById(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customer'
      }
    }
  }

  // Create customer
  async createCustomer(customerData) {
    try {
      const response = await apiClient.post(endpoints.customers.list, customerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create customer'
      }
    }
  }

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      const response = await apiClient.put(endpoints.customers.update(id), customerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update customer'
      }
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(endpoints.customers.getById(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete customer'
      }
    }
  }

  // Get customer stats
  async getCustomerStats(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(`${endpoints.customers.list}/stats`, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customer stats'
      }
    }
  }

  // Lookup customer by phone
  async lookupCustomer(phone, businessId) {
    try {
      const params = { phone }
      if (businessId) params.businessId = businessId

      const response = await apiClient.get(`${endpoints.customers.list}/lookup`, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Customer not found'
      }
    }
  }

  // ============ SERVICE MANAGEMENT ============

  // Get services
  async getServices(params = {}) {
    try {
      // Filter out invalid businessId values
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.services.list, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch services'
      }
    }
  }

  // Get service by ID
  async getService(id, config = {}) {
    try {
      const response = await apiClient.get(endpoints.services.getById(id), config)
      return { success: true, ...response.data }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch service'
      }
    }
  }

  // Create service
  async createService(serviceData) {
    try {
      const response = await apiClient.post(endpoints.services.create, serviceData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create service'
      }
    }
  }

  // Update service
  async updateService(id, serviceData) {
    try {
      const response = await apiClient.put(endpoints.services.update(id), serviceData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update service'
      }
    }
  }

  // Delete service
  async deleteService(id) {
    try {
      const response = await apiClient.delete(endpoints.services.delete(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete service'
      }
    }
  }

  // Get service categories
  async getServiceCategories(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.services.categories, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch service categories'
      }
    }
  }

  // Get popular services
  async getPopularServices(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.services.popular, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch popular services'
      }
    }
  }

  // ============ APPOINTMENT MANAGEMENT ============

  // Get appointments
  async getAppointments(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.appointments.list, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointments'
      }
    }
  }

  // Get appointment stats
  async getAppointmentStats(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.appointments.stats, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment stats'
      }
    }
  }

  // Get appointment by ID
  async getAppointment(id) {
    try {
      const response = await apiClient.get(endpoints.appointments.getById(id))
      return response.data
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
      const response = await apiClient.post(endpoints.appointments.create, appointmentData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create appointment'
      }
    }
  }

  // Update appointment
  async updateAppointment(id, appointmentData) {
    try {
      const response = await apiClient.put(endpoints.appointments.update(id), appointmentData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update appointment'
      }
    }
  }

  // Confirm appointment
  async confirmAppointment(id) {
    try {
      const response = await apiClient.post(endpoints.appointments.confirm(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to confirm appointment'
      }
    }
  }

  // Start appointment
  async startAppointment(id) {
    try {
      const response = await apiClient.post(endpoints.appointments.start(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to start appointment'
      }
    }
  }

  // Complete appointment
  async completeAppointment(id, data = {}) {
    try {
      const response = await apiClient.post(endpoints.appointments.complete(id), data)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to complete appointment'
      }
    }
  }

  // Cancel appointment
  async cancelAppointment(id, data = {}) {
    try {
      const response = await apiClient.post(endpoints.appointments.cancel(id), data)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel appointment'
      }
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(id, data) {
    try {
      const response = await apiClient.post(endpoints.appointments.reschedule(id), data)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reschedule appointment'
      }
    }
  }

  // Mark as no-show
  async markNoShow(id) {
    try {
      const response = await apiClient.post(endpoints.appointments.markNoShow(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark as no-show'
      }
    }
  }

  // ============ INVOICE MANAGEMENT ============

  // Get invoices
  async getInvoices(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.invoices.list, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch invoices'
      }
    }
  }

  // Get invoice stats
  async getInvoiceStats(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.invoices.stats, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch invoice stats'
      }
    }
  }

  // Get invoice by ID
  async getInvoice(id) {
    try {
      const response = await apiClient.get(endpoints.invoices.getById(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch invoice'
      }
    }
  }

  // Create invoice
  async createInvoice(invoiceData) {
    try {
      const response = await apiClient.post(endpoints.invoices.create, invoiceData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create invoice'
      }
    }
  }

  // Update invoice
  async updateInvoice(id, invoiceData) {
    try {
      const response = await apiClient.put(endpoints.invoices.update(id), invoiceData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update invoice'
      }
    }
  }

  // Cancel invoice
  async cancelInvoice(id) {
    try {
      const response = await apiClient.post(endpoints.invoices.cancel(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel invoice'
      }
    }
  }

  // Add payment to invoice
  async addPaymentToInvoice(id, paymentData) {
    try {
      const response = await apiClient.post(endpoints.invoices.addPayment(id), paymentData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add payment'
      }
    }
  }

  // Add refund to invoice
  async addRefundToInvoice(id, refundData) {
    try {
      const response = await apiClient.post(endpoints.invoices.addRefund(id), refundData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add refund'
      }
    }
  }

  // Get overdue invoices
  async getOverdueInvoices(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.invoices.overdue, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch overdue invoices'
      }
    }
  }

  // ============ REVIEW MANAGEMENT ============

  // Get reviews
  async getReviews(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.reviews.list, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      }
    }
  }

  // Get review stats
  async getReviewStats(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.reviews.stats, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch review stats'
      }
    }
  }

  // Get review by ID
  async getReview(id) {
    try {
      const response = await apiClient.get(endpoints.reviews.getById(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch review'
      }
    }
  }

  // Create review
  async createReview(reviewData) {
    try {
      const response = await apiClient.post(endpoints.reviews.create, reviewData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create review'
      }
    }
  }

  // Update review
  async updateReview(id, reviewData) {
    try {
      const response = await apiClient.put(endpoints.reviews.update(id), reviewData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update review'
      }
    }
  }

  // Delete review
  async deleteReview(id) {
    try {
      const response = await apiClient.delete(endpoints.reviews.delete(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete review'
      }
    }
  }

  // Approve review
  async approveReview(id) {
    try {
      const response = await apiClient.post(endpoints.reviews.approve(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve review'
      }
    }
  }

  // Reject review
  async rejectReview(id, reason) {
    try {
      const response = await apiClient.post(endpoints.reviews.reject(id), { reason })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject review'
      }
    }
  }

  // Add response to review
  async addResponseToReview(id, responseData) {
    try {
      const response = await apiClient.post(endpoints.reviews.addResponse(id), responseData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add response'
      }
    }
  }

  // Get featured reviews
  async getFeaturedReviews(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.reviews.featured, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured reviews'
      }
    }
  }

  // ============ ANALYTICS ============

  // Get dashboard overview
  async getDashboardOverview(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.dashboard, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard overview'
      }
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.revenue, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch revenue analytics'
      }
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.customers, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customer analytics'
      }
    }
  }

  // Get service performance
  async getServicePerformance(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.services, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch service performance'
      }
    }
  }

  // Get appointment analytics
  async getAppointmentAnalytics(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.appointments, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment analytics'
      }
    }
  }

  // Get staff performance
  async getStaffPerformance(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.staff, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch staff performance'
      }
    }
  }

  // Get trends and predictions
  async getTrendsAndPredictions(params = {}) {
    try {
      const cleanParams = { ...params }
      if (cleanParams.businessId && (cleanParams.businessId === 'undefined' || cleanParams.businessId === 'null' || !String(cleanParams.businessId).trim())) {
        delete cleanParams.businessId
      }
      const response = await apiClient.get(endpoints.analytics.trends, { params: cleanParams })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch trends and predictions'
      }
    }
  }

  // ============ INQUIRY MANAGEMENT ============
  async getInquiries(params = {}) {
    try {
      const response = await apiClient.get(endpoints.inquiries.list, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch inquiries'
      }
    }
  }

  async markInquiryAsReceived(id) {
    try {
      const response = await apiClient.patch(endpoints.inquiries.receive(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update inquiry status'
      }
    }
  }

  async deleteInquiry(id) {
    try {
      const response = await apiClient.delete(endpoints.inquiries.delete(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete inquiry'
      }
    }
  }

  async exportInquiries(params = {}) {
    try {
      const response = await apiClient.get(endpoints.inquiries.export, {
        params,
        responseType: params.format === 'csv' ? 'blob' : 'arraybuffer'
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export inquiries'
      }
    }
  }

  // ================== WHATSAPP INTEGRATION ==================

  // Get WhatsApp QR code
  async getWhatsAppQR() {
    try {
      const response = await apiClient.get('/admin/whatsapp/qr')
      return response.data
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get QR code'
      }
    }
  }

  // Get WhatsApp connection status
  async getWhatsAppStatus() {
    try {
      const response = await apiClient.get('/admin/whatsapp/status')
      return response.data
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get status'
      }
    }
  }

  // Logout from WhatsApp
  async logoutWhatsApp() {
    try {
      const response = await apiClient.post('/admin/whatsapp/logout')
      return response.data
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to logout'
      }
    }
  }
}

export default new AdminService()
